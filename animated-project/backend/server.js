const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

require("dotenv").config();

const Order = require("./models/Order");
const Review = require("./models/Review");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

if (
  !process.env.ADMIN_EMAIL ||
  !process.env.ADMIN_PASSWORD ||
  !process.env.JWT_SECRET
) {
  throw new Error("Admin credentials or JWT_SECRET missing in .env");
}

app.get("/", (req, res) => {
  res.send("Yolk & Co. backend is running!");
});

app.get("/test-api", (req, res) => {
  res.send("API routes are working!");
});

// ADMIN LOGIN
app.post("/api/admin/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const emailMatch =
      typeof email === "string" &&
      email === process.env.ADMIN_EMAIL;

    const passwordMatch =
      typeof password === "string" &&
      Buffer.byteLength(password) ===
        Buffer.byteLength(process.env.ADMIN_PASSWORD) &&
      crypto.timingSafeEqual(
        Buffer.from(password),
        Buffer.from(process.env.ADMIN_PASSWORD)
      );

    if (!emailMatch || !passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
    });
  }
});

// ADMIN AUTHENTICATION
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please login as admin",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login. Please login again.",
    });
  }
}

// CREATE ORDER
app.post("/api/orders", async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      items,
      totalAmount,
      address,
      latitude,
      longitude,
    } = req.body;

    const newOrder = new Order({
      customerName,
      email,
      phone,
      items,
      totalAmount,
      address,
      latitude,
      longitude,
    });

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

// GET ALL ORDERS - ADMIN
app.get("/api/orders", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({
      message: "Orders fetched successfully!",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
    });
  }
});

// DASHBOARD STATISTICS
app.get("/api/admin/dashboard", verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Order.distinct("email");

    const revenueResult = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const pendingOrders = await Order.countDocuments({
      status: "Pending",
    });

    const deliveredOrders = await Order.countDocuments({
      status: "Delivered",
    });

    res.json({
      totalOrders,
      totalCustomers: totalCustomers.length,
      totalRevenue: revenueResult[0]?.revenue || 0,
      pendingOrders,
      deliveredOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Dashboard statistics error",
    });
  }
});

// UPDATE ORDER STATUS
app.put("/api/orders/:id/status", verifyAdmin, async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Out for Delivery",
      "Delivered",
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order status updated successfully!",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order status",
    });
  }
});

// TRACK ORDER
app.get("/api/orders/track/:id", async (req, res) => {
  try {
    const { email } = req.query;

    const order = await Order.findOne({
      _id: req.params.id,
      email,
    }).select("items totalAmount status createdAt");

    if (!order) {
      return res.status(404).json({
        message: "Order not found. Check your Order ID and email.",
      });
    }

    res.json({
      message: "Order details fetched successfully!",
      order,
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid Order ID",
    });
  }
});

// ==================================
// CUSTOMER REVIEWS
// ==================================

// CUSTOMER SUBMITS REVIEW
app.post("/api/reviews", async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      customerName.trim().length > 60
    ) {
      return res.status(400).json({
        message: "Please enter a valid name.",
      });
    }

    if (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5) {
      return res.status(400).json({
        message: "Please select a rating between 1 and 5.",
      });
    }

    if (
      typeof comment !== "string" ||
      !comment.trim() ||
      comment.trim().length > 500
    ) {
      return res.status(400).json({
        message: "Please enter feedback (maximum 500 characters).",
      });
    }

    const review = await Review.create({
      customerName: customerName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      status: "Pending",
    });

    res.status(201).json({
      message: "Thank you! Your review has been submitted for approval.",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to submit review.",
    });
  }
});

// GET APPROVED REVIEWS - PUBLIC
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({
      status: "Approved",
    }).sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch reviews.",
    });
  }
});

// GET ALL REVIEWS - ADMIN
app.get("/api/admin/reviews", verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch reviews.",
    });
  }
});

// APPROVE OR REJECT REVIEW - ADMIN
app.put("/api/admin/reviews/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid review status.",
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    res.json({
      message: `Review ${status.toLowerCase()} successfully.`,
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to update review.",
    });
  }
});

// START SERVER
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    await connectDB();
  } catch (error) {
    console.log("Database connection failed:", error.message);
  }
});