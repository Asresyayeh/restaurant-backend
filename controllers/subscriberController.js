const { addSubscriber, getAllSubscribers } = require("../services/subscriberService");

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    await addSubscriber(email);
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const listSubscribers = async (req, res) => {
  try {
    const subscribers = await getAllSubscribers();
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { subscribe, listSubscribers };
