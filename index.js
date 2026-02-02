const express = require("express");

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Splitwise backend running 🚀");
});
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  // basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  res.status(201).json({
    message: "User signup successful",
    user: {
      name,
      email,
    },
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
