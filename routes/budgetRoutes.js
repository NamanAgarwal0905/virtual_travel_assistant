const express = require("express");
const router = express.Router();
const { budgetcal} = require("../controllers/budgetController");

router.post("/estimate-budget", budgetcal);
module.exports = router;
