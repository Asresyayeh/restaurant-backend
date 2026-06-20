const cartService = require("../services/CartService");

const cartController = {
  // Add item to cart
  async addToCart(req, res) {
    try {
      const { menuItemId, quantity } = req.body;
      const userId = req.user._id;

      const cart = await cartService.addToCart(
        userId,
        menuItemId,
        quantity || 1
      );

      res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
        data: cart,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get cart items
  async getCart(req, res) {
    console.log("Fetching cart for user:", req.user._id);

    try {
      if (!req.user || !req.user._id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const userId = req.user._id;
      const cart = await cartService.getCart(userId);

      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error("Error in getCart:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch cart",
      });
    }
  },

  // Remove single item
  async removeItem(req, res) {
    try {
      const { menuItemId } = req.params;
      const userId = req.user._id;

      const cart = await cartService.removeItem(userId, menuItemId);

      res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: cart,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Clear all items
  async clearCart(req, res) {
    try {
      const userId = req.user._id;
      const cart = await cartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        data: cart,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Increase or decrease quantity
  async changeQuantity(req, res) {
    try {
      const { menuItemId } = req.params;
      const { increase } = req.body; // true to increase, false to decrease
      const userId = req.user._id;

      const cart = await cartService.changeQuantity(
        userId,
        menuItemId,
        increase
      );

      res.status(200).json({
        success: true,
        message: "Quantity updated successfully",
        data: cart,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = cartController;
