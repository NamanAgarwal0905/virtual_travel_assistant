const Trip = require("../models/trip"); 
const User = require("../models/user"); 
const createTrip = async (req, res) => {
  try {
    console.log(req.body)
    const { tripType, destination, startDate, endDate, duration, userId } = req.body;
    if (!tripType || !destination || !startDate || !endDate || !duration || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newTrip = new Trip({
      tripType,
      destination,
      startDate,
      endDate,
      duration,
      userId, 
    });
    const savedTrip = await newTrip.save();
    await User.findByIdAndUpdate(userId, { $push: { usertrips: savedTrip._id } });
    res.status(201).json({
      message: "Trip created successfully!",
      trip: savedTrip,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getmytrip=async(req,res)=>{
  try {
    const { userId } = req.body;
    console.log(userId)
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const trips = await Trip.find({ userId });
    console.log(trips)
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = {
  createTrip,
  getmytrip,
};
