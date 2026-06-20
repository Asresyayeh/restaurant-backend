const Restaurant = require("../models/Restaurant");

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

const getAllRestaurantsService = async () => {
  const restaurants = await Restaurant.find().sort({ createdAt: -1 });
  return restaurants;
};

const getRestaurantByIdService = async (id) => {
  const restaurant = await Restaurant.findById(id).populate("menuItem");
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }
  return restaurant;
};

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

const deleteRestaurantService = async (id) => {
  const restaurant = await Restaurant.findByIdAndDelete(id);
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return { message: "Restaurant deleted successfully" };
};

module.exports = {
  createRestaurantService,
  getAllRestaurantsService,
  getRestaurantByIdService,
  updateRestaurantService,
  deleteRestaurantService,
};
