const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const cohere = require("cohere-ai");

dotenv.config();
const router = express.Router();
router.use(cors());
cohere.init(process.env.COHERE_API_KEY);
const BUDGET_SCHEMA = {
    type: "object",
    properties: {
        estimated_cost: { type: "number" },
        cost_breakdown: {
            type: "object",
            properties: {
                activities: { type: "number" },
                meals: { type: "number" },
                hotel: { type: "number" },
                food: { type: "number" },
                transport: { type: "number" },
                miscellaneous: { type: "number" }
            },
            required: ["activities", "meals", "hotel", "food", "transport", "miscellaneous"]
        }
    },
    required: ["estimated_cost", "cost_breakdown"]
};
const cleanNumber = (value) => {
    if (typeof value === "string") {
        return parseFloat(value.replace("$", "").replace(",", "").trim());
    }
    return parseFloat(value);
};
const budgetcal=async (req, res) => {
    try {
        const { itinerary, hotel_price, members, days = 1 } = req.body;
        const adults = parseInt(members.adults, 10) || 0;
        const children = parseInt(members.children, 10) || 0;
        const total_members = adults + children;

        if (!itinerary || !hotel_price || total_members === 0) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const prompt = `
            Analyze this travel itinerary and estimate costs in USD:
            Itinerary: ${itinerary}
            Hotel price: $${hotel_price}/night
            Travelers: ${adults} adults, ${children} children
            Duration: ${days} days
            
            Return ONLY valid JSON:
            {
                "estimated_cost": number,
                "cost_breakdown": {
                    "activities": number,
                    "meals": number,
                    "hotel": number
                }
            }
        `;

        const response = await cohere.generate({
            model: "command",
            prompt,
            max_tokens: 200,
        });

        const aiText = response.body.generations[0].text;
        const jsonStr = aiText.substring(aiText.indexOf("{"), aiText.lastIndexOf("}") + 1);
        const costData = JSON.parse(jsonStr);
        costData.estimated_cost = cleanNumber(costData.estimated_cost);
        costData.cost_breakdown.activities = cleanNumber(costData.cost_breakdown.activities);
        costData.cost_breakdown.meals = cleanNumber(costData.cost_breakdown.meals);
        costData.cost_breakdown.hotel = cleanNumber(costData.cost_breakdown.hotel);
        const food_cost = 50 * total_members * days;
        const transport_cost = 20 * total_members * days;
        const misc_cost = 0.2 * (costData.estimated_cost + food_cost + transport_cost);
        const total_budget = costData.estimated_cost + food_cost + transport_cost + misc_cost;
        costData.final_budget = total_budget;
        costData.cost_breakdown.food = food_cost;
        costData.cost_breakdown.transport = transport_cost;
        costData.cost_breakdown.miscellaneous = misc_cost;

        return res.json({ status: "success", data: costData });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = {budgetcal};
