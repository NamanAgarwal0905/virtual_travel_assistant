const User = require("../models/user"); 
exports.getUsername = async (req, res) => {
  try {
    console.log(req.body)
    const  email  = req.body.email;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ username: user.name ,userId: user._id});
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
