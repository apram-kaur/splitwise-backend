const express = require("express");
const router = express.Router();

const { createGroup, getGroups } = require("../controllers/groupControllers");

router.post("/create", createGroup);
router.get("/", getGroups);
console.log("Group routes loaded");

module.exports = router;
console.log(createGroup);
