const Restaurant = require("../models/Restaurant");
const Menu = require("../models/Menu");

/**
 * Creates a new restaurant record
 */
const createRestaurantService = async ({
  name,
  description,
  location,
  image,
}) => {
  if (!name || !location) {
    throw new Error("Name and location are required");
  }

  const restaurant = await Restaurant.create({
    name,
    description,
    location,
    image,
  });

  return restaurant;
};

/**
 * Fetches all restaurants sorted by newest first
 */
const getAllRestaurantsService = async () => {
  const restaurants = await Restaurant.find().sort({ createdAt: -1 });
  return restaurants;
};

/**
 * Dynamic Core Function: Aggregates restaurant profile data and its associated menu items array
 * Used by both global fetch workflows and the logged-in Restaurant Admin's dashboard (/my-store)
 */
const getRestaurantByIdService = async (id) => {
  const restaurant = await Restaurant.findById(id);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  // Look up all menu elements pointing back to this restaurant's specific ObjectId reference
  const menuItems = await Menu.find({ restaurant: id });

  // Convert the Mongoose document structure into a mutable JS object and attach the dishes
  return {
    ...restaurant.toObject(),
    menuItem: menuItems, // Plugs straight into your frontend dashboard tracking loops
  };
};

/**
 * Updates an existing restaurant document by ID
 */
const updateRestaurantService = async (id, updateData) => {
  const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return restaurant;
};

/**
 * Deletes a restaurant from the database
 */
const deleteRestaurantService = async (id) => {
  const restaurant = await Restaurant.findByIdAndDelete(id);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return { message: "Restaurant deleted successfully" };
};

// Explicit clean module export mappings hook up to your Controllers
module.exports = {
  createRestaurantService,
  getAllRestaurantsService,
  getRestaurantByIdService,
  updateRestaurantService,
  deleteRestaurantService,
};
