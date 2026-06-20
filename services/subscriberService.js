const Subscriber = require("../models/Subscriber");

const addSubscriber = async (email) => {
  const existing = await Subscriber.findOne({ email });
  if (existing) throw new Error("Email already subscribed");

  const subscriber = new Subscriber({ email });
  return await subscriber.save();
};

const getAllSubscribers = async () => {
  return await Subscriber.find({});
};

module.exports = { addSubscriber, getAllSubscribers };
