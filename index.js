require("dotenv").config();
const connectDB = require("./config/db");

const express = require("express");
const expenseRoutes = require("./routes/expenseRoutes");


const app = express();
app.use(express.json());
app.use("/api/expenses", expenseRoutes);

// In-memory storage
const users = [];
let expenses = [];
let balances = {}; // balances[from][to] = amount

// Utility function to add balance
function addBalance(from, to, amount) {
  if (!balances[from]) {
    balances[from] = {};
  }

  if (!balances[from][to]) {
    balances[from][to] = 0;
  }

  balances[from][to] += amount;
}
function getNetBalances() {
  const net = {};

  for (let from in balances) {
    for (let to in balances[from]) {
      const amount = balances[from][to];

      net[from] = (net[from] || 0) - amount;
      net[to] = (net[to] || 0) + amount;
    }
  }

  return net;
}

connectDB();

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Splitwise backend running 🚀");
});

// SIGNUP
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      error: "Email already registered",
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
  };

  users.push(newUser);

  res.status(201).json({
    message: "User signup successful",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password required",
    });
  }

  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      error: "Invalid password",
    });
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});


// GET USERS
app.get("/users", (req, res) => {
  res.json(users);
});

// GET BALANCES
app.get("/balances", (req, res) => {
  res.json(balances);
});
app.get("/balances/net", (req, res) => {
  const netBalances = getNetBalances();
  res.json(netBalances);
});
app.get("/balances/settle", (req, res) => {
  const settlements = settleBalances();
  res.json(settlements);
});

function settleBalances() {
  const net = getNetBalances();

  const debtors = [];
  const creditors = [];

  for (let userId in net) {
    if (net[userId] < 0) {
      debtors.push({ userId, amount: -net[userId] });
    } else if (net[userId] > 0) {
      creditors.push({ userId, amount: net[userId] });
    }
  }

  const settlements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: Number(debtor.userId),
      to: Number(creditor.userId),
      amount: settleAmount,
    });

    debtor.amount -= settleAmount;
    creditor.amount -= settleAmount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return settlements;
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
