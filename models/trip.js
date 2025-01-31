const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    tripType: {
      type: String,
      enum: ["Solo", "Family", "Friends"],
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    userId:{
        type:String,
        required:true,
    }
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;