const {
  createCateringOrder,
  getAllCateringOrders,
  getCateringOrderById,
  updateCateringOrder,
  deleteCateringOrder,
} = require("../services/cateringService");

// Submit (Create) a catering order
const submitCateringOrderController = async (req, res) => {
  try {
    const order = await createCateringOrder(req.body);
    res.json({ success: true, message: "Order submitted successfully", order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all catering orders
const getAllCateringOrdersController = async (req, res) => {
  try {
    const orders = await getAllCateringOrders();
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single catering order
const getCateringOrderByIdController = async (req, res) => {
  try {
    const order = await getCateringOrderById(req.params.id);
    res.json({ success: true, order });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// Update a catering order
const updateCateringOrderController = async (req, res) => {
  try {
    const order = await updateCateringOrder(req.params.id, req.body);
    res.json({ success: true, message: "Order updated successfully", order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a catering order
const deleteCateringOrderController = async (req, res) => {
  try {
    await deleteCateringOrder(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

module.exports = {
  submitCateringOrderController,
  getAllCateringOrdersController,
  getCateringOrderByIdController,
  updateCateringOrderController,
  deleteCateringOrderController,
};
