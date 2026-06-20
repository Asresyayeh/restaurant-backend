const MenuItem = require("../models/Menu");
const Restaurant = require("../models/Restaurant");

const createMenuItem = async (menuData) => {
  const menuItem = new MenuItem({
    ...menuData,
    restaurant: menuData.restaurant || menuData.restaurantId,
  });

  await menuItem.save();

  if (menuItem.restaurant) {
    await Restaurant.findByIdAndUpdate(menuItem.restaurant, {
      $push: { menu: menuItem._id },
    });
  }

  return menuItem;
};

const getAllMenuItems = async () => {
  return await MenuItem.find().populate("restaurant");
};

const getMenuByRestaurant = async (restaurantId) => {
  return await MenuItem.find({ restaurant: restaurantId }).populate(
    "restaurant"
  );
};

const getMenuItemById = async (id) => {
  return await MenuItem.findById(id).populate("restaurant");
};


const updateMenuItem = async (id, updateData) => {
  return await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
};


const deleteMenuItem = async (menuItemId, restaurantId) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurant: restaurantId,
    });

    if (!menuItem) {
      throw new Error("Menu item not found for this restaurant");
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $pull: { menu: menuItemId } },
      { new: true }
    );

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    await MenuItem.findByIdAndDelete(menuItemId);
    return menuItem;

  } catch (err) {
    console.error("Failed to delete menu item:", err);
    throw err; 
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
