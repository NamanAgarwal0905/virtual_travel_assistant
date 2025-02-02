const express = require("express");
const router = express.Router();
const { geocode,poi,gen} = require("../controllers/itineryController");

router.post("/geocode", geocode);
router.post("/poi",poi);
router.post("/generate",gen);
module.exports = router;
