const express = require("express");
const router = express.Router();
const menuController = require("../controllers/MenuController");
const { upload } = require("../config/cloudinary");

router.post("/", upload.single("image"), menuController.createMenuItem);

router.put("/:id", upload.single("image"), menuController.updateMenuItem);

router.get("/", menuController.getAllMenuItems);

router.get("/restaurant/:restaurantId", menuController.getMenuByRestaurant);

router.get("/:id", menuController.getMenuItemById);

router.delete(
  "/restaurants/:restaurantId/menu/:menuItemId",
  menuController.deleteMenuItem
);
module.exports = router;
