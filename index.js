
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB().catch(() => {
  console.log("⚠️ MongoDB not connected, running in offline mode");
});


// Routes
app.get("/", (req, res) => {
  res.send("Splitwise backend running 🚀");
});
app.get("/test", (req, res) => {
  res.send("Groups route test");
});

app.use("/api/expenses", expenseRoutes);
app.use("/api/groups", groupRoutes);


// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
