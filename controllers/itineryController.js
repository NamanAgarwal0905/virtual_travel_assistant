const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const { CohereClient } = require('cohere-ai');
const {HttpsProxyAgent }= require('https-proxy-agent');
const { fetch, ProxyAgent } = require('undici');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
  
});
const proxyUrl = 'http://edcguest:edcguest@172.31.100.25:3128'; // Replace with actual proxy details
const agent = new HttpsProxyAgent(proxyUrl);
dotenv.config();
const app = express();
const port=process.env.PORT

  const axiosConfig = {
    proxy: {
        host: '172.31.100.25',
        port: 3128,
        auth: {
            username: 'edcguest',
            password: 'edcguest'
        }
    }
};
app.use(express.json());
const geocode=async (req, res) => {
    try {
        console.log("here")
        const { location } = req.body;
        console.log(location)
        if (!location) {
            return res.status(400).json({ error: 'Location parameter missing' });
        }
        
        const response = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
            params: {
                q: location,
                key: process.env.OPENCAGE_API_KEY,
                no_annotations: 1,
                limit: 1
            }
        });
        
        const data = response.data;
        console.log(data)
        if (data.total_results === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }
        
        const result = data.results[0];
        res.json({
            lat: result.geometry.lat,
            lon: result.geometry.lng,
            formatted: result.formatted
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Points of Interest
const poi=async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude required' });
        }

        const overpassUrl = "https://overpass-api.de/api/interpreter";
        const query = `
        [out:json];
        node(around:5000,${lat},${lon})["tourism"];
        out center;
        `;

        const response = await axios.post(overpassUrl, query, {
            headers: { 'Content-Type': 'text/plain' }
        });

        res.json(response.data.elements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generate Itinerary
const gen = async (req, res) => {
    try {
        const { location, days = 3, interests = 'general sightseeing' } = req.body;
        console.log("Received request:", req.body);

        const prompt = `Create a detailed ${days}-day itinerary for ${location} focusing on ${interests}.
        Include for each day:
        - Morning activities
        - Afternoon activities
        - Evening activities
        - Restaurant recommendations
        - Travel tips
        
        Format with clear day headings and bullet points:`;
        try{
        const response = await cohere.generate({
            model: 'command',
            prompt,
            max_tokens: 1000,
            temperature: 0.7,
            num_generations: 1
        });
        console.log(response);
        res.json({
            itinerary: response.body.generations[0].text,
            status: 'success'
        });
    }
    catch(error){
        console.log(error)
    }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message, status: 'error' });
    }
};

module.exports={geocode,poi,gen};

