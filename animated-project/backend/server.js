const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Order = require("./models/Order");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Home API
app.get("/", (req, res) => {
  res.send("Yolk & Co. backend is running!");
});

// Test API
app.get("/test-api", (req, res) => {
  res.send("API routes are working!");
});

// Create Order API
app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error placing order",
      error: error.message,
    });
  }
});

// Get All Orders API
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Orders fetched successfully!",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// Track Order API
// Track Order API
app.get("/api/orders/track/:id", async (req, res) => {
  try {
    const { email } = req.query;

    const order = await Order.findOne({
      _id: req.params.id,
      email: email,
    }).select("items totalAmount status createdAt");

    if (!order) {
      return res.status(404).json({
        message: "Order not found. Check your Order ID and email.",
      });
    }

    res.status(200).json({
      message: "Order details fetched successfully!",
      order,
    });

  } catch (error) {
    res.status(400).json({
      message: "Invalid Order ID",
    });
  }
});
// Start Server
const PORT = 5000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    await connectDB();
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
});