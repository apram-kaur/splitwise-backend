const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseControllers");

router.post("/create", expenseController.createExpense);

module.exports = router;
