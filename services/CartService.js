const Cart = require("../models/Cart");
const MenuItem = require("../models/Menu");
const User = require("../models/User");
MenuItem.findById("68eaaddfc4706eb880dc1d59").then(console.log);

const cartService = {};


cartService.addToCart = async (userId, menuItemId, quantity = 1) => {

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) throw new Error("Menu item not found");

 
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }


  const existingItem = cart.items.find(
    (item) => item.menuItem.toString() === menuItemId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      menuItem: menuItem._id,
      price: menuItem.price,
      quantity,
    });
  }

  await cart.save();
  return cart.populate("items.menuItem");
};

cartService.getCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.menuItem",
    populate: { path: "restaurant" },
  });

  if (!cart) {
    return { user: userId, items: [], status: "pending" };
  }

  return cart;
};

cartService.removeItem = async (userId, menuItemId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return { user: userId, items: [], status: "pending" };

  cart.items = cart.items.filter(
    (item) => item.menuItem.toString() !== menuItemId
  );

  await cart.save();
  return cart.populate("items.menuItem");
};

cartService.clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return { user: userId, items: [], status: "pending" };

  cart.items = [];
  await cart.save();
  return cart;
};


cartService.changeQuantity = async (userId, menuItemId, increase = true) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return { user: userId, items: [], status: "pending" };

  const item = cart.items.find(
    (item) => item.menuItem.toString() === menuItemId
  );

  if (!item) return cart;

  if (increase) item.quantity += 1;
  else item.quantity = Math.max(1, item.quantity - 1);

  await cart.save();
  return cart.populate("items.menuItem");
};

module.exports = cartService;
