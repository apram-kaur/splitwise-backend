require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

connectDB().catch(() => {
  console.log("⚠️ MongoDB not connected, running in offline mode");
});

app.get("/", (req, res) => {
  res.send("Splitwise backend running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/groups", groupRoutes);
console.log("JWT_SECRET:", process.env.JWT_SECRET);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
