const express = require("express");
const router = express.Router();
const cartController = require("../controllers/CartController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/add", cartController.addToCart);

router.get("/:userId", cartController.getCart);

router.delete("/remove/:menuItemId", cartController.removeItem);

router.delete("/clear", cartController.clearCart);

router.put("/quantity/:menuItemId", cartController.changeQuantity);

module.exports = router;
