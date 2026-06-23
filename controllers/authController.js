const {
  registerUserService,
  loginUserService,
  getUserProfile,
  getAllUsers,
} = require("../services/authService");

const registerUser = async (req, res) => {
  try {
    // ✅ 1. Add 'role' to your destructuring assignment
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ 2. Pass 'role' into your service object payload
    const { user, token } = await registerUserService({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { user, token } = await loginUserService({ email, password });

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user._id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  getAllUsersController,
};
