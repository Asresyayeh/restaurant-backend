const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/PaymentController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * Real Chapa Payment Routes
 *
 * These endpoints integrate with real Chapa API
 * Test mode in development, live in production
 */

// Initialize Chapa payment (protected)
router.post("/initialize", authMiddleware, paymentController.initializeChapa);

// Chapa webhook (no auth needed - called by Chapa)
router.post("/webhook", paymentController.handleWebhook);

// Verify payment status (protected)
router.get(
  "/verify/:reference",
  authMiddleware,
  paymentController.verifyPayment
);

// Get payment status (protected)
router.get(
  "/status/:reference",
  authMiddleware,
  paymentController.getPaymentStatus
);

// Get available payment methods (public)
router.get("/methods", paymentController.getPaymentMethods);

module.exports = router;
