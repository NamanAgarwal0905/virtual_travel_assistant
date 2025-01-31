from flask import Flask, request, jsonify
from flask_cors import CORS
import cohere
import os
import json
from jsonschema import validate
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

co = cohere.Client(os.getenv('COHERE_API_KEY'))

# JSON Schema for validation
BUDGET_SCHEMA = {
    "type": "object",
    "properties": {
        "estimated_cost": {"type": "number"},
        "cost_breakdown": {
            "type": "object",
            "properties": {
                "activities": {"type": "number"},
                "meals": {"type": "number"},
                "hotel": {"type": "number"}
            },
            "required": ["activities", "meals", "hotel"]
        }
    },
    "required": ["estimated_cost"]
}

@app.route('/estimate-budget', methods=['POST'])
def calculate_budget():
    data = request.json
    
    try:
        itinerary = data['itinerary']
        hotel_price = float(data['hotel_price'])
        adults = int(data['members']['adults'])
        children = int(data['members']['children'])
        days = int(data.get('days', 1))
        total_members = adults + children
        
        response = co.generate(
            model='command',
            prompt=f"""Analyze this travel itinerary and estimate costs in USD:
            {itinerary}
            Hotel price: ${hotel_price}/night
            Travelers: {adults} adults, {children} children
            Duration: {days} days
            
            Return ONLY valid JSON without any formatting:
            {{
                "estimated_cost": number,
                "cost_breakdown": {{
                    "activities": number,
                    "meals": number,
                    "hotel": number
                }}
            }}""",
            max_tokens=200
        )
        
        # Parse AI response
        ai_text = response.generations[0].text
        print("AI text before JSON extraction:", ai_text)
        
        json_str = ai_text[ai_text.find('{'):ai_text.rfind('}')+1]
        print("Extracted JSON string:", json_str)
        
        cost_data = json.loads(json_str)
        
        def clean_number(value):
            if isinstance(value, str):
                cleaned = value.replace('$', '').replace(',', '').strip()
                return float(cleaned)
            return float(value)
        
        cost_data['estimated_cost'] = clean_number(cost_data['estimated_cost'])
        cost_data['cost_breakdown']['activities'] = clean_number(cost_data['cost_breakdown']['activities'])
        cost_data['cost_breakdown']['meals'] = clean_number(cost_data['cost_breakdown']['meals'])
        cost_data['cost_breakdown']['hotel'] = clean_number(cost_data['cost_breakdown']['hotel'])
        
        # Add structured cost estimation
        food_cost = 50 * total_members * days  # Assuming $50 per person per day
        transport_cost = 20 * total_members * days  # Assuming $20 per person per day
        misc_cost = 0.2 * (cost_data['estimated_cost'] + food_cost + transport_cost)  # 20% extra for miscellaneous expenses
        
        total_budget = cost_data['estimated_cost'] + food_cost + transport_cost + misc_cost
        
        cost_data['final_budget'] = total_budget
        cost_data['cost_breakdown']['food'] = food_cost
        cost_data['cost_breakdown']['transport'] = transport_cost
        cost_data['cost_breakdown']['miscellaneous'] = misc_cost
        
        validate(instance=cost_data, schema=BUDGET_SCHEMA)
        
        return jsonify({
            'status': 'success',
            'data': cost_data
        })

    except json.JSONDecodeError as e:
        print("JSON Decode Error:", str(e))  # Debug: Print JSON parsing error
        return jsonify({'error': 'Failed to parse AI response', 'details': str(e)}), 500
    except Exception as e:
        print("Other Error:", str(e))  # Debug: Print other errors
        return jsonify({'error': str(e)}), 400

    
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
        print("Error:", str(e))  
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
