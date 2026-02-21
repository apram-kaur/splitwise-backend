const express = require("express");
const router = express.Router();

const { createGroup, getGroups } = require("../controllers/groupControllers");
const { sendInvite } = require("../controllers/inviteController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createGroup);
router.get("/", protect, getGroups);
router.post("/:groupId/invite", protect, sendInvite);

module.exports = router;
