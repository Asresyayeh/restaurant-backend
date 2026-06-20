const mongoose = require("mongoose");
require("dotenv").config();

console.log("Starting MongoDB connection test...");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB Atlas:");
    console.error(err);
    process.exit(1);
  });
