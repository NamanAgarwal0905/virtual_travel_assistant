
from flask import Flask, jsonify, request
import requests
import pandas as pd
from datetime import datetime, timedelta
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os

app = Flask(__name__)

destinations = pd.read_csv('destinations.csv')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

MODEL_PATH = 'models/recommender_model.pkl'
VECTORIZER_PATH = 'models/tfidf_vectorizer.pkl'

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
        
        # Check if response contains events
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
    
def load_recommender_model():
    """Load pre-trained recommendation model"""
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
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
    user_vector = vectorizer.transform([' '.join(trip_descriptions)])
    
    # Find similar destinations
    distances, indices = model.kneighbors(user_vector)
    recommended = destinations.iloc[indices[0]][:3]
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
    """Train and save the recommendation model"""
    tfidf = TfidfVectorizer(stop_words='english')
    features = tfidf.fit_transform(destinations['tags'])
    
    model = NearestNeighbors(n_neighbors=5, metric='cosine')
    model.fit(features)
    
    joblib.dump(model, MODEL_PATH)
    joblib.dump(tfidf, VECTORIZER_PATH)

if __name__ == '__main__':
    if not os.path.exists(MODEL_PATH):
        train_model()
    app.run(debug=True)