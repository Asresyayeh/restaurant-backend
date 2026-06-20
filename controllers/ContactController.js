const ContactService = require("../services/ContactService");

const ContactController = {
  // Create a new message
  async createMessage(req, res) {
    try {
      const message = await ContactService.createMessage(req.body);
      res.status(201).json({ success: true, message: "Message sent!", data: message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Optional: get all messages (for admin)
  async getAllMessages(req, res) {
    try {
      const messages = await ContactService.getAllMessages();
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Optional: delete message
  async deleteMessage(req, res) {
    try {
      const result = await ContactService.deleteMessage(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  },
};

module.exports = ContactController;
