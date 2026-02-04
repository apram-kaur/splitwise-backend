const express = require("express");

const app = express();
app.use(express.json());
const users = [];


// Test route
app.get("/", (req, res) => {
  res.send("Server Restarted");
});
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  // duplicate email check
  const existingUser = users.find(user => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      error: "Email already registered"
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
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password required"
    });
  }

  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      error: "Invalid password"
    });
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

app.get("/users", (req, res) => {
  res.json(users);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
