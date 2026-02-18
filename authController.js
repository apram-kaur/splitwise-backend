const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const register = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, email, password } = req.body;

    console.log("STEP 1");

    const existingUser = await User.findOne({ email });
    console.log("STEP 2");

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("STEP 3");

    const user = await User.create({ name, email, password });
    console.log("STEP 4");

    const token = generateToken(user._id);
    console.log("STEP 5");

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR FULL:", error);
    res.status(500).json({ message: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate real JWT
    const token = generateToken(user._id);

    // 4. Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
