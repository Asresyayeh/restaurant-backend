const Category = require("../models/Category");

const categoryService = {
  
  async createCategory(name, description = "", image = "") {
   
    const existing = await Category.findOne({ name });
    if (existing) throw new Error("Category already exists");

    const category = new Category({
      name,
      description,
      image, 
    });

    await category.save();
    return category;
  },

  async getAllCategories() {
    const categories = await Category.find().sort({ name: 1 });
    return categories;
  },

  async getCategoryById(id) {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  },

  async deleteCategory(id) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error("Category not found");
    return { message: "Category deleted successfully" };
  },
};

module.exports = categoryService;
