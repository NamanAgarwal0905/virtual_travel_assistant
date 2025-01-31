
const mongoose = require('mongoose');
const hotelSchema = new mongoose.Schema({
  hotel_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  facilities: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  score: {
    family: {
      type: Number,
      default: 0,
    },
    friends: {
      type: Number,
      default: 0,
    },
    solo: {
      type: Number,
      default: 0,
    },
  },
}, { timestamps: true });
const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
