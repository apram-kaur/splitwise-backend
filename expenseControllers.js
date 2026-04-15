const Expense = require("../models/Expense");
const Group = require("../models/Group");

// ================================
// CREATE EXPENSE
// ================================
const createExpense = async (req, res) => {
  try {
    const { title, amount, group, splitType, splits } = req.body;

    if (!title || !amount || !group) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let finalSplits = [];

    // =========================
    // EQUAL SPLIT
    // =========================
    if (splitType === "equal") {
      if (!splits || splits.length === 0) {
        return res.status(400).json({ message: "Participants required" });
      }

      const share = Number((amount / splits.length).toFixed(2));

      finalSplits = splits.map((userId) => ({
        user: userId,
        amount: share,
      }));
    }

    // =========================
    // EXACT SPLIT
    // =========================
    else if (splitType === "exact") {
      if (!splits || splits.length === 0) {
        return res.status(400).json({ message: "Splits required" });
      }

      const total = splits.reduce((sum, s) => sum + s.amount, 0);

      if (Number(total.toFixed(2)) !== Number(amount.toFixed(2))) {
        return res.status(400).json({
          message: "Exact amounts must add up to total expense",
        });
      }

      finalSplits = splits;
    }

    // =========================
    // PERCENTAGE SPLIT
    // =========================
    else if (splitType === "percentage") {
      if (!splits || splits.length === 0) {
        return res.status(400).json({ message: "Splits required" });
      }

      const totalPercent = splits.reduce((sum, s) => sum + s.percent, 0);

      if (totalPercent !== 100) {
        return res.status(400).json({
          message: "Percentages must add up to 100",
        });
      }

      finalSplits = splits.map((s) => ({
        user: s.user,
        amount: Number(((s.percent / 100) * amount).toFixed(2)),
      }));
    } else {
      return res.status(400).json({ message: "Invalid split type" });
    }

    const expense = await Expense.create({
      title,
      amount,
      group,
      paidBy: req.user._id,
      splitType,
      splits: finalSplits,
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================================
// GET EXPENSES BY GROUP
// ================================
const getExpensesByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splits.user", "name email");

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

// ================================
// CALCULATE BALANCES (PER GROUP)
// ================================
const getBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId });

    let balances = {};

    expenses.forEach((expense) => {
      expense.splits.forEach((split) => {
        const userId = split.user.toString();

        if (!balances[userId]) balances[userId] = 0;

        if (expense.paidBy.toString() === userId) {
          balances[userId] += expense.amount - split.amount;
        } else {
          balances[userId] -= split.amount;
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

// ================================
// SETTLEMENT MINIMIZATION
// ================================
const getSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId });

    let balances = {};

    expenses.forEach((expense) => {
      expense.splits.forEach((split) => {
        const id = split.user.toString();

        if (!balances[id]) balances[id] = 0;

        if (id === expense.paidBy.toString()) {
          balances[id] += expense.amount - split.amount;
        } else {
          balances[id] -= split.amount;
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
        amount: Number(settleAmount.toFixed(2)),
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

// ================================
// CREATE PERSONAL EXPENSE
// ================================
const createPersonalExpense = async (req, res) => {
  try {
    const { title, amount, category, isPaid } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      isPaid: isPaid !== undefined ? isPaid : true,
      paidBy: req.user._id,
      group: null,
      splitType: "exact",
      splits: [
        {
          user: req.user._id,
          amount: amount,
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================================
// GET PERSONAL EXPENSES
// ================================
const getPersonalExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      paidBy: req.user._id,
      group: null,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getExpensesByGroup,
  getBalances,
  getSettlements,
  createPersonalExpense,
  getPersonalExpenses,
};