const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/ReviewController");

// Add a new review
router.post("/add", reviewController.addReview);

// Get all reviews for a restaurant
router.get("/restaurant/:restaurantId", reviewController.getReviewsByRestaurant);

// Get all reviews by a user
router.get("/user/:userId", reviewController.getReviewsByUser);

// Delete a review
router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;
