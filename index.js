const express = require("express");

const app = express();
app.use(express.json());

const users = [];
let expenses = [];
let balances = {};

function addBalance(from, to, amount) {
  if (!balances[from]) {
    balances[from] = {};
  }

  if (!balances[from][to]) {
    balances[from][to] = 0;
  }

  balances[from][to] += amount;
}

// Test route
app.get("/", (req, res) => {
  res.send("Server Restarted");
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

app.post("/expenses", (req, res) => {
  const { paidBy, amount, participants, splitType, splits } = req.body;

  if (!paidBy || !amount) {
    return res.status(400).json({ error: "Invalid expense data" });
  }

  let balances = [];

  // EQUAL SPLIT
  if (splitType === "equal") {
    if (!participants || participants.length === 0) {
      return res.status(400).json({ error: "Participants required" });
    }

    const splitAmount = amount / participants.length;

    participants.forEach(person => {
  if (person !== paidBy) {
    addBalance(person, paidBy, splitAmount);
  }
});

  }

  // CUSTOM SPLIT
  else if (splitType === "custom") {
    if (!splits || splits.length === 0) {
      return res.status(400).json({ error: "Splits required" });
    }

    const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);

    if (totalSplit !== amount) {
      return res.status(400).json({
        error: "Split amounts do not match total expense",
      });
    }

    splits.forEach(split => {
  addBalance(split.email, paidBy, split.amount);
});


  }

  else {
    return res.status(400).json({ error: "Invalid split type" });
  }

  res.status(201).json({
    message: "Expense added successfully",
    balances,
  });
});


// GET USERS
app.get("/users", (req, res) => {
  res.json(users);
});
app.get("/balances", (req, res) => {
  res.json(balances);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
