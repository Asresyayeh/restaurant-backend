const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/profile", authMiddleware, authController.getProfile);

router.get("/", authMiddleware, authController.getAllUsersController);

router.post(
  "/create-restaurant-admin",
  authMiddleware,
  authController.registerUser,
);

module.exports = router;
