const express = require("express");
const router = express.Router();

const {
  submitCateringOrderController,
  getAllCateringOrdersController,
  getCateringOrderByIdController,
  updateCateringOrderController,
  deleteCateringOrderController,
} = require("../controllers/cateringController");


router.post("/", submitCateringOrderController);

// Read
router.get("/", getAllCateringOrdersController);
router.get("/:id", getCateringOrderByIdController);

// Update
router.put("/:id", updateCateringOrderController);

// Delete
router.delete("/:id", deleteCateringOrderController);

module.exports = router;
