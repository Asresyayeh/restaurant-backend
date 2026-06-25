const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUserService = async ({
  name,
  email,
  password,
  role,
  restaurantId,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "customer",
    restaurantId: restaurantId || null,
  });

  const token = jwt.sign(
    { id: user._id, role: user.role, restaurantId: user.restaurantId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
    token,
  };
};

const loginUserService = async ({ email, password }) => {
  // ✅ Added .populate("restaurantId") so the profile object returned on login
  // immediately carries the restaurant info if needed.
  const user = await User.findOne({ email }).populate("restaurantId");

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      restaurantId: user.restaurantId?._id || user.restaurantId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
    token,
  };
};

const getUserProfile = async (userId) => {
  // ✅ Added .populate here as well to swap the raw ID string for the actual object data safely
  const user = await User.findById(userId)
    .select("-password")
    .populate("restaurantId");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const getAllUsers = async () => {
  // ✅ Added .populate("restaurantId") so your Super Admin view safely resolves the complete map
  const users = await User.find().select("-password").populate("restaurantId");

  return users;
};

module.exports = {
  registerUserService,
  loginUserService,
  getUserProfile,
  getAllUsers,
};
