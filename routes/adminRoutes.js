const express = require("express");
const { getAllOrders } = require("../controllers/OrderController");
const { getProfile } = require("../controllers/authController");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = express.Router();

router.get("/", adminMiddleware, getAllOrders);
router.get("/profile", adminMiddleware, getProfile);

module.exports = router;
