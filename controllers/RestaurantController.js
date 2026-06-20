const restaurantService = require("../services/RestaurantService");

const createRestaurant = async (req, res) => {
  try {
    const { name, description, location, image } = req.body;

    // Use uploaded file if available, otherwise use JSON image URL
    const imageUrl = req.file ? req.file.path : image;

    if (!name || !location || !imageUrl) {
      return res
        .status(400)
        .json({ message: "Name, location, and image are required" });
    }

    const restaurant = await restaurantService.createRestaurantService({
      name,
      description,
      location,
      image: imageUrl, // Cloudinary URL
    });

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantService.getAllRestaurantsService();
    res.status(200).json(restaurants); // array is returned normally
  } catch (error) {
    console.error(error);
    res.status(500).json([]); // return empty array on error
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantByIdService(id);
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If a new image is uploaded, replace it
    if (req.file) {
      updateData.image = req.file.path;
    }

    const restaurant = await restaurantService.updateRestaurantService(
      id,
      updateData
    );

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restaurantService.deleteRestaurantService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
