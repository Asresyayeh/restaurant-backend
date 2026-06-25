// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    // ✅ THE FIX: Attach the complete profile fields to req.user
    req.user = {
      _id: user._id,
      role: user.role, // Matches your super_admin check loops
      restaurantId: user.restaurantId, // Plugs cleanly into your /my-store dashboard engine
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
