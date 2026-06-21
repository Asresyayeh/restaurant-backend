const CateringOrder = require("../models/Catering");
const Restaurant = require("../models/Restaurant");
const CarteringOrder = require("../models/Catering");
const Menu = require("../models/Menu");

const createCateringOrder = async (data) => {
  const { restaurant, menuItems, totalPrice, ...customerInfo } = data;

  const rest = await Restaurant.findById(restaurant);
  if (!rest) throw new Error("Restaurant not found");

  let calculatedTotal = 0;

  for (const i of menuItems) {
    const itemTargetId = i.item ? i.item.toString() : "";

    const dbItem = await Menu.findById(itemTargetId);

    if (dbItem) {
      calculatedTotal += dbItem.price * Number(i.quantity);
      console.log(
        `🎯 [CATERING MATCH] Found ${dbItem.name}: $${dbItem.price} x ${i.quantity}`,
      );
    } else {
      console.warn(
        `⚠️ [CATERING WARNING] Item ID ${itemTargetId} was not found in the database.`,
      );
    }
  }

  // Round both numbers to stop microdecimal variations from breaking comparison checks
  const finalCalculated = Math.round(calculatedTotal * 100) / 100;
  const finalExpected = Math.round(Number(totalPrice) * 100) / 100;

  console.log(
    `📊 [PRICE VERIFICATION] Client: ${finalExpected} | DB Calculated: ${finalCalculated}`,
  );

  if (finalCalculated !== finalExpected) {
    throw new Error(
      `Total price mismatch. Expected ${finalExpected} but calculated ${finalCalculated}`,
    );
  }

  const order = new CateringOrder({
    restaurant,
    restaurantName: rest.name,
    menuItems,
    totalPrice: finalExpected,
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
