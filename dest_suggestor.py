from flask import Flask, jsonify, request
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import tensorflow as tf
from tensorflow.keras.layers import Dense, Input
from tensorflow.keras.models import Model, model_from_json
from sklearn.feature_extraction.text import TfidfVectorizer
import json
import os

app = Flask(__name__)

destinations = pd.read_csv('destinations.csv')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

MODEL_PATH = 'models/recommender_model.json'
WEIGHTS_PATH = 'models/recommender.weights.h5'
VECTORIZER_PATH = 'models/tfidf_vectorizer.json'

def get_upcoming_events():
    params = {
        "apikey": TICKETMASTER_API_KEY,
        "startDateTime": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "endDateTime": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "classificationName": "Travel,Music",
        "size": 2
    }
    
    try:
        response = requests.get("https://app.ticketmaster.com/discovery/v2/events.json", params=params)
        response.raise_for_status()
        
        data = response.json()
        if '_embedded' not in data or 'events' not in data['_embedded']:
            print("No events found in the response")
            return []
        
        events = data['_embedded']['events'][:2]
        return [{
            "name": e.get('name', 'Unknown Event'),
            "location": f"{e['_embedded']['venues'][0].get('city', {}).get('name', 'Unknown')}, {e['_embedded']['venues'][0].get('country', {}).get('name', 'Unknown')}",
            "date": e.get('dates', {}).get('start', {}).get('localDate', 'Unknown'),
            "url": e.get('url', '#')
        } for e in events]
    
    except requests.exceptions.RequestException as e:
        print(f"Network error fetching events: {e}")
        return []
    except ValueError as e:
        print(f"JSON parsing error: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error fetching events: {e}")
        return []

def save_vectorizer(vectorizer, path):
    """Save TfidfVectorizer to JSON"""
    vectorizer_params = {
        'vocabulary_': vectorizer.vocabulary_,
        'idf_': vectorizer.idf_.tolist(),
        'stop_words_': list(vectorizer.stop_words) if vectorizer.stop_words else None
    }
    with open(path, 'w') as f:
        json.dump(vectorizer_params, f)

def load_vectorizer(path):
    """Load TfidfVectorizer from JSON"""
    with open(path, 'r') as f:
        params = json.load(f)
    
    vectorizer = TfidfVectorizer(stop_words='english')
    vectorizer.vocabulary_ = params['vocabulary_']
    vectorizer.idf_ = np.array(params['idf_'])
    vectorizer.stop_words_ = set(params['stop_words_']) if params['stop_words_'] else None
    return vectorizer

def load_recommender_model():
    """Load pre-trained recommendation model"""
    try:
        # Load model architecture
        with open(MODEL_PATH, 'r') as f:
            model_json = f.read()
        model = model_from_json(model_json)
        
        # Load model weights
        model.load_weights(WEIGHTS_PATH)
        
        # Load vectorizer
        vectorizer = load_vectorizer(VECTORIZER_PATH)
        
        return model, vectorizer
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None

def recommend_based_on_history(past_trips):
    """Generate recommendations based on user's trip history"""
    model, vectorizer = load_recommender_model()
    if model is None or vectorizer is None or not past_trips:
        return []
    
    # Vectorize user's trip history
    trip_descriptions = [' '.join(trip['tags']) for trip in past_trips]
    user_vector = vectorizer.transform([' '.join(trip_descriptions)]).toarray()
    
    # Get embeddings for all destinations
    all_destinations = vectorizer.transform(destinations['tags']).toarray()
    
    # Get similarity scores
    user_embedding = model.predict(user_vector)
    destination_embeddings = model.predict(all_destinations)
    
    # Calculate cosine similarity
    similarities = tf.keras.losses.cosine_similarity(
        tf.expand_dims(user_embedding[0], 0),
        destination_embeddings
    )
    
    # Get top 3 recommendations
    top_indices = tf.argsort(similarities)[:3].numpy()
    recommended = destinations.iloc[top_indices]
    
    return recommended.to_dict('records')

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.get_json()
    
    if not data or 'past_trips' not in data:
        return jsonify({"error": "Missing required field: past_trips"}), 400
    
    past_trips = data['past_trips'][-5:]  # Get last 5 trips
    
    # Get event-based recommendations
    event_recommendations = get_upcoming_events()
    
    # Get user-based recommendations
    user_recommendations = recommend_based_on_history(past_trips)
    
    return jsonify({
        "provided_trips": past_trips,
        "festival_recommendations": event_recommendations,
        "user_based_recommendations": user_recommendations
    })

def train_model():
    """Train and save the recommendation model using TensorFlow/Keras"""
    tfidf = TfidfVectorizer(stop_words='english')
    features = tfidf.fit_transform(destinations['tags']).toarray()
    input_dim = features.shape[1]
    
    inputs = Input(shape=(input_dim,))
    encoded = Dense(256, activation='relu')(inputs)
    encoded = Dense(128, activation='relu')(encoded)
    encoded = Dense(64, activation='relu')(encoded)
    decoded = Dense(32, activation='relu')(encoded)
    decoded = Dense(input_dim, activation='sigmoid')(decoded)
    
    model = Model(inputs=inputs, outputs=decoded)
    model.compile(optimizer='adam', loss='mse')
    
    model.fit(
        features,
        features,
        epochs=50,
        batch_size=32,
        shuffle=True,
        validation_split=0.2
    )
    
    model_json = model.to_json()
    with open(MODEL_PATH, 'w') as f:
        f.write(model_json)
    
    model.save_weights(WEIGHTS_PATH)

    save_vectorizer(tfidf, VECTORIZER_PATH)

if __name__ == '__main__':
    if not os.path.exists(MODEL_PATH):
        train_model()
    app.run(debug=True)