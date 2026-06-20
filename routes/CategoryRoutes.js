const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/CategoryController");
const { upload } = require("../config/cloudinary");

router.post("/add", upload.single("image"), categoryController.createCategory);

router.get("/", categoryController.getAllCategories);

router.get("/:id", categoryController.getCategoryById);

router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
