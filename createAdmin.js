// createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: "asru@gmail.com" });
    if (existingAdmin) {
      console.log(
        "Admin already exists with ID:",
        existingAdmin._id.toString()
      );
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Create admin user
    const admin = new User({
      name: "asru",
      email: "asru@gmail.com",
      password: hashedPassword,
    });

    await admin.save();
    console.log("Admin created successfully!");
    console.log("Admin ID (use this as VITE_ADMIN_ID):", admin._id.toString());

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
