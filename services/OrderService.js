const Order = require("../models/Order");
const MenuItem = require("../models/Menu");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

const createOrderService = async (
  userId,
  restaurantId,
  items,
  deliveryAddress,
  paymentMethod
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  let totalPrice = 0;
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem) throw new Error(`Menu item not found: ${item.menuItem}`);
    totalPrice += menuItem.price * item.quantity;
  }

  const order = new Order({
    user: userId,
    restaurant: restaurantId,
    items,
    totalPrice,
    deliveryAddress,
    paymentMethod,
  });

  return await order.save();
};

const getUserOrdersService = async (userId) => {
  return await Order.find({ user: userId })
    .populate("user", "name email")
    .populate("restaurant", "name location")
    .populate("items.menuItem", "name price");
};

const getAllOrdersService = async () => {
  return await Order.find()
    .populate("user", "name email")
    .populate("restaurant", "name location")
    .populate("items.menuItem", "name price");
};

const updateOrderStatusService = async (orderId, status) => {
  if(!status) throw new Error("Status is required");
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.status = status;
  return await order.save();
};
const deleteOrderService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  await Order.findByIdAndDelete(orderId);
  return { message: "Order deleted successfully" };
};

module.exports = {
  createOrderService,
  getUserOrdersService,
  getAllOrdersService,
  deleteOrderService,
  updateOrderStatusService,
};
