const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY ;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      console.log(name)
      console.log(email)
      console.log(password)
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({ name, email, password: hashedPassword });
      await user.save();
      res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Received login request:", email);
  
      const user = await User.findOne({ email });
      console.log(user)
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
      const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, { expiresIn: "7d" });
  
      res.json({ token, refreshToken });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  refreshToken: (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

    jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid refresh token" });

      const newToken = jwt.sign({ userId: decoded.userId }, SECRET_KEY, { expiresIn: "1h" });
      res.json({ token: newToken });
    });
  },
};

module.exports = authController;
