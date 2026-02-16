const Expense = require("../models/Expense");


// CREATE EXPENSE (Memory Mode)
const createExpense = async (req, res) => {
  try {
    const { title, amount, paidBy, participants } = req.body;

    if (!title || !amount || !paidBy || !participants) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newExpense = await Expense.create({
      title,
      amount,
      paidBy,
      participants,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully 🎉",
      data: newExpense,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL EXPENSES
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// CALCULATE NET BALANCES
const getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find();

    let balances = {};

    expenses.forEach((expense) => {
      const share = expense.amount / expense.participants.length;

      expense.participants.forEach((person) => {
        const id = person.toString();

        if (!balances[id]) balances[id] = 0;

        if (id === expense.paidBy.toString()) {
          balances[id] += expense.amount - share;
        } else {
          balances[id] -= share;
        }
      });
    });

    res.status(200).json({
      success: true,
      data: balances,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// SETTLEMENT MINIMIZATION
const getSettlements = async (req, res) => {
  try {
    const expenses = await Expense.find();

    let balances = {};

    expenses.forEach((expense) => {
      const share = expense.amount / expense.participants.length;

      expense.participants.forEach((person) => {
        const id = person.toString();

        if (!balances[id]) balances[id] = 0;

        if (id === expense.paidBy.toString()) {
          balances[id] += expense.amount - share;
        } else {
          balances[id] -= share;
        }
      });
    });

    let creditors = [];
    let debtors = [];

    for (let person in balances) {
      if (balances[person] > 0) {
        creditors.push({ person, amount: balances[person] });
      } else if (balances[person] < 0) {
        debtors.push({ person, amount: -balances[person] });
      }
    }

    let settlements = [];

    while (creditors.length > 0 && debtors.length > 0) {
      let creditor = creditors[0];
      let debtor = debtors[0];

      let settleAmount = Math.min(creditor.amount, debtor.amount);

      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: settleAmount,
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount === 0) creditors.shift();
      if (debtor.amount === 0) debtors.shift();
    }

    res.status(200).json({
      success: true,
      data: settlements,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createExpense,
  getAllExpenses,
  getBalances,
  getSettlements,
};
