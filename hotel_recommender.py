from flask import Flask, request, jsonify
import requests
import pandas as pd
import json

app = Flask(__name__)

# API credentials and base URL
base_url = "http://api.tbotechnology.in/TBOHolidays_HotelAPI"
username = "hackathontest"
password = "Hac@98910186"

# Function to fetch hotel codes by city
def get_hotels(city_id):
    end_point = "/TBOHotelCodeList"
    url = base_url + end_point
    data = {
        "CityCode": city_id,
        "IsDetailedResponse": "false"
    }

    hotels = requests.post(url, data, auth=(username, password))
    if hotels.status_code == 200:
        return hotels.json().get("Hotels", [])
    else:
        return {"error": hotels.text}

# Function to fetch hotel details by hotel code
def get_hotel_desc(hotel_id):
    end_point = "/HotelDetails"
    url = base_url + end_point
    data = {
        "Hotelcodes": hotel_id,
        "Language": "EN"
    }
    desc = requests.post(url, data, auth=(username, password))
    if desc.status_code == 200:
        hotel_details = desc.json().get("HotelDetails", [])[0]
        return hotel_details
    else:
        return {"error": "Unable to fetch hotel details"}

# Scoring function
def score_hotel(hotel):
    criteria = {
        'family': {
            'keywords': ['peaceful', 'family', 'lake', 'safe'],
            'facilities': ['Parking', 'Garden', 'Terrace', 'Child-friendly']
        },
        'friends': {
            'keywords': ['group', 'fun', 'nightlife', 'restaurants', 'hangout'],
            'facilities': ['Tennis Court', 'Skiing', 'Restaurants', 'Terrace']
        },
        'solo': {
            'keywords': ['tranquil', 'adventure', 'explore', 'hiking'],
            'facilities': ['Non-smoking rooms', 'Fishing', 'Hiking', 'Nature']
        }
    }
    scores = {'family': 0, 'friends': 0, 'solo': 0}
    description = hotel.get('Description', "").lower()
    facilities = hotel.get('HotelFacilities', [])

    for trip_type, factors in criteria.items():
        # Score based on keywords
        for keyword in factors['keywords']:
            if keyword in description:
                scores[trip_type] += 3  # Weight for keywords

        # Score based on facilities
        for facility in factors['facilities']:
            if facility in facilities:
                scores[trip_type] += 2  # Weight for facilities

    return scores

@app.route('/process_pipeline', methods=['POST'])
def process_pipeline():
    data = request.json  # Expecting {"city_code": "<city_code>"}
    city_code = data.get("city_code")

    if not city_code:
        return jsonify({"error": "City code is required"}), 400

    # Fetch hotels
    hotels = get_hotels(city_code)
    if "error" in hotels:
        return jsonify({"error": hotels["error"]}), 500

    # Prepare DataFrame
    df = pd.DataFrame(hotels)
    rating_mapping = {
        'OneStar': 1,
        'TwoStar': 2,
        'ThreeStar': 3,
        'FourStar': 4,
        'FiveStar': 5,
        'All': 0
    }
    df['HotelRating'] = df["HotelRating"].map(rating_mapping)
    df = df.sort_values(by="HotelRating", ascending=False)

    # Process each hotel
    final_json = {}
    for index, row in df.iterrows():
        description = get_hotel_desc(row['HotelCode'])
        if "error" in description:
            continue  # Skip hotels with errors in fetching details

        score = score_hotel(description)
        hotel_key = f"hotel{row['HotelCode']}"
        final_json[hotel_key] = {
            "desc": description,
            "score": score
        }

    return jsonify(final_json)

if __name__ == '__main__':
    app.run(debug=True)
