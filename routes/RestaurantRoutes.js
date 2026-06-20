const express = require("express");
const restaurantController = require("../controllers/RestaurantController");
const { upload } = require("../config/cloudinary"); 

const router = express.Router();


router.post(
  "/",
  upload.single("image"),
  (req, res, next) => {
    console.log("BODY:", req.body); 
    console.log("FILE:", req.file); 
    next(); 
  },
  restaurantController.createRestaurant
);


router.put(
  "/:id",
  upload.single("image"),
  restaurantController.updateRestaurant
);


router.get("/", restaurantController.getAllRestaurants);

router.get("/:id", restaurantController.getRestaurantById);


router.delete("/:id", restaurantController.deleteRestaurant);

module.exports = router;
