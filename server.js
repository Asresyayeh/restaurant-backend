const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

const corsOptions = require("./config/corsOptions");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/RestaurantRoutes");
const orderRoutes = require("./routes/OrderRoutes");
const menuRoutes = require("./routes/MenuRoutes");
const cartRoutes = require("./routes/CartRoutes");
const reviewRoutes = require("./routes/ReviewRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/ContactRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cateringRoutes = require("./routes/cateringRoutes");
const subscriberRoutes = require("./routes/sebscriberRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

dotenv.config();

const app = express();

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/catering", cateringRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/auth", passwordRoutes);

app.get("/", (req, res) => {
  res.send("Restaurant Ordering System API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
