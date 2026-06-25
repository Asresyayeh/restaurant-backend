const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      // Clearer role separation
      enum: ["customer", "restaurant_admin", "admin"],
      default: "customer",
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      // Keep it default null, because super_admins and customers don't belong to a restaurant
      default: null,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
module.exports = User;
