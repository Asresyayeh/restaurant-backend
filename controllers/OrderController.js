const {
  createOrderService,
  getUserOrdersService,
  getAllOrdersService,
  updateOrderStatusService,
  deleteOrderService,
} = require("../services/OrderService");

const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, restaurant } = req.body;

    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const restaurantId = restaurant;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant not found" });
    }

    const order = await createOrderService(
      userId,
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod
    );

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await getUserOrdersService(req.params.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersService();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteOrderService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await updateOrderStatusService(
      req.params.id,
      req.body.status
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
