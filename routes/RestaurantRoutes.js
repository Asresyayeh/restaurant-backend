const express = require("express");
const restaurantController = require("../controllers/RestaurantController");
const authMiddleware = require("../middlewares/authMiddleware"); // Import your auth middleware
const { upload } = require("../config/cloudinary");

const router = express.Router();

// ==========================================
// 1. Static Specific Routes (MUST COME FIRST)
// ==========================================
router.get(
  "/my-store",
  authMiddleware, // Protect this so req.user.restaurantId is populated from the token
  restaurantController.getMyRestaurantDetails,
);

// ==========================================
// 2. Standard Global & Creation Routes
// ==========================================
router.post(
  "/",
  upload.single("image"),
  (req, res, next) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    next();
  },
  restaurantController.createRestaurant,
);

router.get("/", restaurantController.getAllRestaurants);

// ==========================================
// 3. Dynamic Parameter Routes (MUST COME LAST)
// ==========================================
router.put(
  "/:id",
  upload.single("image"),
  restaurantController.updateRestaurant,
);

router.get("/:id", restaurantController.getRestaurantById);

router.delete("/:id", restaurantController.deleteRestaurant);

module.exports = router;
