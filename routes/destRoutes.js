const express = require("express");
const router = express.Router();
const {
    getUserRecentTrips,
    getUpcomingEvents,
    getRecommendations
} = require("../controllers/destController");

router.get("/recent-trips", getUserRecentTrips);
router.get("/events", getUpcomingEvents);
router.post("/recommendations", getRecommendations);

module.exports = router;
