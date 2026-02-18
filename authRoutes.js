const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});
console.log("REGISTER:", register);
console.log("LOGIN:", login);

module.exports = router;
