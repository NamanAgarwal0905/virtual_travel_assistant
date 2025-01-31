const express = require("express");
const router = express.Router();
const { getUsername } = require("../controllers/fetchController");

router.post("/getUsername", getUsername);
module.exports = router;
