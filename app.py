from flask import Flask, request, jsonify
from flask_cors import CORS
import cohere
import os
from dotenv import load_dotenv
import requests

load_dotenv()  

app = Flask(__name__)
CORS(app)  

co = cohere.Client(os.getenv('COHERE_API_KEY'))

@app.route('/geocode', methods=['POST'])
def geocode_location():
    try:
        location = request.json.get('location')
        if not location:
            return jsonify({'error': 'Location parameter missing'}), 400
            
        
        response = requests.get(
            "https://api.opencagedata.com/geocode/v1/json",
            params={
                'q': location,
                'key': os.getenv('OPENCAGE_API_KEY'),
                'no_annotations': 1,
                'limit': 1
            }
        )
        
        data = response.json()
        
        if data['total_results'] == 0:
            return jsonify({'error': 'Location not found'}), 404
            
        result = data['results'][0]
        return jsonify({
            'lat': result['geometry']['lat'],
            'lon': result['geometry']['lng'],
            'formatted': result['formatted']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/poi', methods=['POST'])
def get_points_of_interest():
    try:
        data = request.json
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        node(around:5000,{data['lat']},{data['lon']})["tourism"];
        out center;
        """
        response = requests.post(overpass_url, data=query)
        return jsonify(response.json()['elements'])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate_itinerary():
    try:
        data = request.json
        print("Received request:", data)  # Debug logging
        
        
        prompt = f"""Create a detailed {data.get('days', 3)}-day itinerary for {data['location']} focusing on {data.get('interests', 'general sightseeing')}.
Include for each day:
- Morning activities
- Afternoon activities
- Evening activities
- Restaurant recommendations
- Travel tips

Format with clear day headings and bullet points:"""

        # Generate with Cohere
        response = co.generate(
            model='command',
            prompt=prompt,
            max_tokens=1000,
            temperature=0.7,
            num_generations=1
        )

        return jsonify({
            'itinerary': response.generations[0].text,
            'status': 'success'
        })
    
    except Exception as e:
        print("Error:", str(e))  # Debug logging
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)