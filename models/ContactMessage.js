// models/ContactMessage.js
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const ContactMessage = mongoose.model("ContactMessage", contactSchema);

module.exports = ContactMessage;
