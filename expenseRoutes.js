const express = require("express");
const router = express.Router();

const {
  createExpense,
  getAllExpenses,
  getBalances,
  getSettlements

} = require("../controllers/expenseControllers");

router.post("/create", createExpense);
router.get("/", getAllExpenses);
router.get("/balances", getBalances);
router.get("/settlements", getSettlements);
router.get("/balances/:groupId", getBalances);
router.get("/settlements/:groupId", getSettlements);

module.exports = router;
