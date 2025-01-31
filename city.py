import json
import requests
import time
from typing import Dict, List
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('city_fetch.log'),
        logging.StreamHandler()
    ]
)

class TBOCityFetcher:
    def __init__(self):
        self.base_url = "http://api.tbotechnology.in/TBOHolidays_HotelAPI"
        self.username = "hackathontest"
        self.password = "Hac@98910186"
        
    def fetch_cities(self, country_code: str) -> List[Dict]:
        try:
            url = f"{self.base_url}/CityList"
            payload = {
                "CountryCode": country_code
            }
            
            response = requests.post(
                url,
                data=payload,
                auth=(self.username, self.password)
            )
            
            response.raise_for_status()
            data = response.json()
            
            if data.get('Status', {}).get('Code') == 200:
                return data.get('CityList', [])
            else:
                logging.error(f"API error for {country_code}: {data.get('Status', {}).get('Description')}")
                return []
            
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching cities for country {country_code}: {str(e)}")
            return []
        except json.JSONDecodeError as e:
            logging.error(f"Error decoding response for country {country_code}: {str(e)}")
            return []

def load_country_list(file_path: str) -> List[Dict]:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if 'CountryList' not in data:
                logging.error("Invalid file format: 'CountryList' key not found")
                return []
            return data['CountryList']
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding JSON: {str(e)}")
        return []
    except Exception as e:
        logging.error(f"Error loading country list: {str(e)}")
        return []

def save_city_mapping(city_mapping: Dict, output_file: str):
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(city_mapping, f, indent=4, ensure_ascii=False)
        logging.info(f"City mapping saved to {output_file}")
    except Exception as e:
        logging.error(f"Error saving city mapping: {str(e)}")

def main():
    COUNTRY_LIST_FILE = "country_list.json"
    OUTPUT_FILE = "city_mapping.json"
    
    tbo_client = TBOCityFetcher()
    countries = load_country_list(COUNTRY_LIST_FILE)
    if not countries:
        logging.error("No countries loaded. Exiting.")
        return
    
    city_mapping = {}
    
    total_countries = len(countries)
    for index, country in enumerate(countries, 1):
        country_code = country['Code']
        logging.info(f"Processing {index}/{total_countries}: {country['Name']} ({country_code})")
        
        # Fetch cities for current country
        cities = tbo_client.fetch_cities(country_code)
        
        # Process cities data and add to mapping
        for city in cities:
            city_mapping[city['Name']] = city['Code']
        
        time.sleep(1)
    
    save_city_mapping(city_mapping, OUTPUT_FILE)
    logging.info(f"Processing completed! Processed {total_countries} countries")

if __name__ == "__main__":
    main()