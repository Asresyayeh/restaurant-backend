const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const reviewService = {
  // 📝 Add new review
  async addReview(userId, restaurantId, rating, comment) {
    // Validate user and restaurant
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    // Check if user already reviewed this restaurant
    const existing = await Review.findOne({ user: userId, restaurant: restaurantId });
    if (existing) throw new Error("You already reviewed this restaurant");

    const review = new Review({
      user: userId,
      restaurant: restaurantId,
      rating,
      comment,
    });

    await review.save();

    // Recalculate average rating for the restaurant
    await this.updateRestaurantRating(restaurantId);

    return review.populate("user", "name email");
  },

  // 📋 Get all reviews for a restaurant
  async getReviewsByRestaurant(restaurantId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return reviews;
  },

  // 🙋 Get all reviews by a user
  async getReviewsByUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const reviews = await Review.find({ user: userId })
      .populate("restaurant", "name location")
      .sort({ createdAt: -1 });

    return reviews;
  },

  // ❌ Delete a review
  async deleteReview(userId, reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    // Ensure only the author can delete it
    if (review.user.toString() !== userId.toString()) {
      throw new Error("You are not allowed to delete this review");
    }

    await Review.findByIdAndDelete(reviewId);

    // Update restaurant’s average rating
    await this.updateRestaurantRating(review.restaurant);

    return { message: "Review deleted successfully" };
  },

  // ⚙️ Helper: Update restaurant rating
  async updateRestaurantRating(restaurantId) {
    const reviews = await Review.find({ restaurant: restaurantId });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await Restaurant.findByIdAndUpdate(restaurantId, { rating: avgRating });
  },
};

module.exports = reviewService;
