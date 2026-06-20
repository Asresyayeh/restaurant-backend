const CateringOrder = require("../models/Catering");
const Restaurant = require("../models/Restaurant");


const createCateringOrder = async (data) => {
  const { restaurant, menuItems, totalPrice, ...customerInfo } = data;

  const rest = await Restaurant.findById(restaurant).populate("menuItem");
  if (!rest) throw new Error("Restaurant not found");

  let calculatedTotal = 0;
  menuItems.forEach((i) => {
    const menuItem = rest.menuItem.find((m) => m._id.toString() === i.item);
    if (menuItem) calculatedTotal += menuItem.price * i.quantity;
  });

  if (calculatedTotal !== totalPrice) {
    throw new Error("Total price mismatch");
  }

  const order = new CateringOrder({
    restaurant,
    restaurantName: rest.name,
    menuItems,
    totalPrice,
    ...customerInfo,
  });

  await order.save();
  return order;
};

const getAllCateringOrders = async () => {
  return await CateringOrder.find().populate("menuItems.item");
};

const getCateringOrderById = async (id) => {
  const order = await CateringOrder.findById(id).populate("menuItems.item");
  if (!order) throw new Error("Order not found");
  return order;
};

const updateCateringOrder = async (id, updateData) => {
  const order = await CateringOrder.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!order) throw new Error("Order not found");
  return order;
};

const deleteCateringOrder = async (id) => {
  const order = await CateringOrder.findByIdAndDelete(id);
  if (!order) throw new Error("Order not found");
  return order;
};

module.exports = {
  createCateringOrder,
  getAllCateringOrders,
  getCateringOrderById,
  updateCateringOrder,
  deleteCateringOrder,
};
