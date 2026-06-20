const menuService = require("../services/MenuService");

// Create menu item with image upload
const createMenuItem = async (req, res) => {
  try {
    const { name, price, restaurant } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Cloudinary image URL

    if (!name || !price || !restaurant || !imageUrl) {
      return res
        .status(400)
        .json({ message: "All fields including image are required" });
    }

    const menuItem = await menuService.createMenuItem({
      name,
      price,
      restaurant,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await menuService.getAllMenuItems();
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get menu items by restaurant
const getMenuByRestaurant = async (req, res) => {
  try {
    const menuItems = await menuService.getMenuByRestaurant(
      req.params.restaurantId
    );
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await menuService.getMenuItemById(req.params.id);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.json(menuItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update menu item (optional new image)
const updateMenuItem = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Replace image if a new file is uploaded
    if (req.file) updateData.image = req.file.path;

    const updatedMenu = await menuService.updateMenuItem(
      req.params.id,
      updateData
    );
    if (!updatedMenu)
      return res.status(404).json({ message: "Menu item not found" });

    res.json({
      success: true,
      message: "Menu item updated successfully",
      data: updatedMenu,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { restaurantId, menuItemId } = req.params;
    const deletedMenu = await menuService.deleteMenuItem(
      menuItemId,
      restaurantId
    );
    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (err) {
    console.error("Controller caught error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuByRestaurant,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
