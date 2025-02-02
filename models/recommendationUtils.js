const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const path = require("path"); 

const MODEL_URL = "http://127.0.0.1:3001/recommender_model.json";
const VECTORIZER_URL = "http://127.0.0.1:3001/tfidf_vectorizer.json";

async function loadModel() {
    try {
        const model = await tf.loadLayersModel(MODEL_URL);
        console.log("Neural network model loaded successfully!");
        return  model;
    } catch (error) {
        console.error("Error loading models:", error);
        return null;
    }
}


function recommendDestinations(pastTrips, model) {
    if (!model || !pastTrips.length) return [];

    const tripTags = pastTrips.map(trip => trip.tags.join(" ")).join(" ");
    const vectorizedInput = tf.tensor1d([tripTags]);

    const predictions = model.predict(vectorizedInput);
    const sortedIndices = predictions.arraySync().map((score, index) => ({ index, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    return sortedIndices.map(item => destinations[item.index]);
}

module.exports = { loadModel, recommendDestinations };
