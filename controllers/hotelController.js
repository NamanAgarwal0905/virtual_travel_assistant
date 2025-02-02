const fs = require('fs');
const path = require('path');
const axios = require('axios');

const base_url = "http://api.tbotechnology.in/TBOHolidays_HotelAPI";
const username = "hackathontest";
const password = "Hac@98910186";
const cityMappingPath = path.join(__dirname, 'city_mapping.json');
const cityMapping = JSON.parse(fs.readFileSync(cityMappingPath, 'utf8'));

async function getHotels(city_id) {
  const url = `${base_url}/TBOHotelCodeList`;
  const data = {
    "CityCode": city_id,
    "IsDetailedResponse": "false"
  };

  try {
    const response = await axios.post(url, data, { auth: { username, password } });
    return response.data.Hotels || [];
  } catch (err) {
    console.error("Error fetching hotels:", err);
    throw new Error("Failed to fetch hotels");
  }
}
function scoreHotel(hotel) {
    const criteria = {
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
    };
    
    const scores = { 'family': 0, 'friends': 0, 'solo': 0 };
    const description = hotel.Description ? hotel.Description.toLowerCase() : '';
    const facilities = hotel.HotelFacilities || [];
  
    // Scoring based on keywords and facilities
    for (const trip_type in criteria) {
      const { keywords, facilities: facilitiesList } = criteria[trip_type];
      
      // Score based on keywords
      keywords.forEach(keyword => {
        if (description.includes(keyword)) {
          scores[trip_type] += 3;  // Weight for keywords
        }
      });
  
      // Score based on facilities
      facilitiesList.forEach(facility => {
        if (facilities.includes(facility)) {
          scores[trip_type] += 2;  // Weight for facilities
        }
      });
    }
  
    return scores;
  }
  
async function getHotelDescription(hotel_id) {
  const url = `${base_url}/HotelDetails`;
  const data = {
    "Hotelcodes": hotel_id,
    "Language": "EN"
  };

  try {
    const response = await axios.post(url, data, { auth: { username, password } });
    return response.data.HotelDetails[0] || {};
  } catch (err) {
    console.error("Error fetching hotel description:", err);
    throw new Error("Failed to fetch hotel description");
  }
}

async function processHotels(destination) {
    try {
      const dest = destination.body.destination;
      console.log(dest)
      const city_code = cityMapping[dest];
  
      if (!city_code) {
        throw new Error(`City code not found for destination: ${destination}`);
      }
  
      const hotels = await getHotels(city_code);
      console.log("Hotels Response:", hotels);
  
      if (!Array.isArray(hotels)) {
        throw new Error("Invalid hotel data received");
      }
  
      const hotelRecommendations = {};
  
      // Limit the hotels array to the first 5 items
      const limitedHotels = hotels.slice(0, 5);
  
      for (const hotel of limitedHotels) {
        const hotelDetails = await getHotelDescription(hotel.HotelCode);
        const scores = scoreHotel(hotelDetails);
        hotelRecommendations[hotel.HotelCode] = {
          desc: hotelDetails,
          score: scores
        };
      }
  
      return hotelRecommendations;
    } catch (err) {
      console.error("Error processing hotels:", err);
      throw new Error("Error processing hotels: " + err.message);
    }
  }
  
module.exports = { processHotels };
