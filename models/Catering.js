const mongoose = require("mongoose");

const cateringOrderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  restaurantName: String,
  customerName: String,
  email: String,
  phone: String,
  eventDate: Date,
  eventType: String,
  guests: Number,
  specialRequests: String,
  menuItems: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      quantity: Number,
      price: Number,
    },
  ],
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now },
});

const CateringOrder = mongoose.model("CateringOrder", cateringOrderSchema);
module.exports = CateringOrder;
