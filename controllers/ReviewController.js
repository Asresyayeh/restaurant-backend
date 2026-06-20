const reviewService = require("../services/ReviewService");

const reviewController = {
  // 📝 Add new review
  async addReview(req, res) {
    try {
      const { restaurantId, rating, comment } = req.body;
      const userId = req.user._id; 
    

      const review = await reviewService.addReview(userId, restaurantId, rating, comment);

      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 📋 Get all reviews for a restaurant
  async getReviewsByRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;
      const reviews = await reviewService.getReviewsByRestaurant(restaurantId);

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  // 🙋 Get all reviews by a user
  async getReviewsByUser(req, res) {
    try {
     const userId = req.user._id;
      const reviews = await reviewService.getReviewsByUser(userId);

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  // ❌ Delete a review
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id;

      const result = await reviewService.deleteReview(userId, reviewId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = reviewController;
