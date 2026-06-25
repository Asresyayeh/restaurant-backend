const restaurantService = require("../services/RestaurantService");

/**
 * Creates a new restaurant record
 */
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

/**
 * Fetches all restaurants globally
 */
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantService.getAllRestaurantsService();
    res.status(200).json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};

/**
 * NEW: Fetches custom workplace details for the logged-in Restaurant Admin
 * Extracted safely from their verified auth session token
 */
const getMyRestaurantDetails = async (req, res) => {
  try {
    // req.user.restaurantId is extracted directly from the verified JWT by your authMiddleware
    const myRestaurantId = req.user?.restaurantId;

    if (!myRestaurantId) {
      return res.status(400).json({
        success: false,
        message: "This user account is not linked to any restaurant workspace.",
      });
    }

    // Call our unified service layer function to get metadata + menu items
    const restaurantData =
      await restaurantService.getRestaurantByIdService(myRestaurantId);

    return res.status(200).json({
      success: true,
      data: restaurantData,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Fetches a single restaurant by its explicit path parameter ID
 */
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantByIdService(id);
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * Updates an existing restaurant record
 */
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
      updateData,
    );

    res.status(200).json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    rm.status(400).json({ message: error.message });
  }
};

/**
 * Deletes a restaurant record
 */
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restaurantService.deleteRestaurantService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// All methods are explicitly mapped for your Router file to read cleanly
module.exports = {
  createRestaurant,
  getAllRestaurants,
  getMyRestaurantDetails, // Added safely here!
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
