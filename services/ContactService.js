const ContactMessage = require("../models/ContactMessage");

const ContactService = {
 
  async createMessage({ name, email, message }) {
    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();
    return newMessage;
  },

  
  async getAllMessages() {
    return await ContactMessage.find().sort({ createdAt: -1 });
  },

  
  async getMessageById(id) {
    const message = await ContactMessage.findById(id);
    if (!message) throw new Error("Message not found");
    return message;
  },

 
  async deleteMessage(id) {
    const result = await ContactMessage.findByIdAndDelete(id);
    if (!result) throw new Error("Message not found");
    return { message: "Message deleted successfully" };
  },
};

module.exports = ContactService;
