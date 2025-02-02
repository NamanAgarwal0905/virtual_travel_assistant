const axios = require("axios");
const mongoose = require("mongoose");
const Trip = require("../models/trip"); // Assuming a Trip model for storing user trips
const { loadModel, recommendDestinations } = require("../models/recommendationUtils");

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

// Fetch user's 5 most recent trips
exports.getUserRecentTrips = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const recentTrips = await Trip.find({ userId }).sort({ date: -1 }).limit(5);

        res.json({ recentTrips });
    } catch (error) {
        console.error("Error fetching recent trips:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Fetch upcoming events
exports.getUpcomingEvents = async (req, res) => {
    try {
        const startDate = new Date().toISOString();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 60);
        
        const params = {
            apikey: TICKETMASTER_API_KEY,
            startDateTime: startDate,
            endDateTime: endDate.toISOString(),
            classificationName: "Travel,Music",
            size: 2,
        };

        const response = await axios.get("https://app.ticketmaster.com/discovery/v2/events.json", { params });

        if (!response.data._embedded || !response.data._embedded.events) {
            return res.json([]);
        }

        const events = response.data._embedded.events.slice(0, 2).map(e => ({
            name: e.name || "Unknown Event",
            location: `${e._embedded.venues[0]?.city?.name || "Unknown"}, ${e._embedded.venues[0]?.country?.name || "Unknown"}`,
            date: e.dates?.start?.localDate || "Unknown",
            url: e.url || "#"
        }));

        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
};

// Get recommendations based on user's past trips
exports.getRecommendations = async (req, res) => {
    try {
        const userId=req.body.userId;
        console.log(userId)

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid userId" });
        }

        const recentTrips = await Trip.find({ userId }).sort({ date: -1 }).limit(5);
        console.log(recentTrips)
        if (!recentTrips.length) {
            return res.status(400).json({ error: "No recent trips found for recommendations" });
        }

        const model = await loadModel();
        console.log(model)
        if (!model) {
            return res.status(500).json({ error: "Recommendation model not available" });
        }

        const userRecommendations = recommendDestinations(recentTrips, model);

        const eventResponse = await axios.get("https://app.ticketmaster.com/discovery/v2/events.json", {
            params: {
                apikey: TICKETMASTER_API_KEY,
                startDateTime: new Date().toISOString(),
                endDateTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                classificationName: "Travel,Music",
                size: 2
            }
        });

        const eventRecommendations = eventResponse.data._embedded?.events?.slice(0, 2).map(e => ({
            name: e.name || "Unknown Event",
            location: `${e._embedded.venues[0]?.city?.name || "Unknown"}, ${e._embedded.venues[0]?.country?.name || "Unknown"}`,
            date: e.dates?.start?.localDate || "Unknown",
            url: e.url || "#"
        })) || [];

        res.json({
            providedTrips: recentTrips,
            festivalRecommendations: eventRecommendations,
            userBasedRecommendations: userRecommendations
        });
    } catch (error) {
        console.error("Error getting recommendations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
