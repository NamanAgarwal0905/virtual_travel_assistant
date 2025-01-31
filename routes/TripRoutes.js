const express = require("express");
const router = express.Router();
const { createTrip } = require("../controllers/TripController"); 
const { getmytrip }=require("../controllers/TripController")
router.post("/create-trip", createTrip);
router.post("/my-trips", getmytrip)
module.exports = router;
