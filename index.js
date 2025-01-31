const express=require('express');
const mongoose = require("mongoose");
const cors=require('cors')
const app=express();
const fs = require("fs");
const authRoutes = require("./routes/authRoutes");
const fecthRoutes=require("./routes/fetchRoutes");
const TripRoutes=require("./routes/TripRoutes");
const hotelRoutes=require("./routes/hotelRoutes")
require('dotenv').config();
app.use(express.json());
app.use(cors({ origin: `${process.env.CORS_ORIGIN}`, credentials: true }));
app.use("/api/auth", authRoutes);
app.use("/api",fecthRoutes);
app.use("/api",TripRoutes);
app.use("/api",hotelRoutes);
const cityMapping = JSON.parse(fs.readFileSync("city_mapping.json", "utf8"));
app.get("/api/destinations", (req, res) => {
  res.json({ destinations: Object.keys(cityMapping) });
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
});
mongoose
  .connect(`${process.env.MONGODB_URI}/${process.env.DATABASE_NAME}`)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err));