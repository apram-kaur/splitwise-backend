const Expense = require("../models/Expense");

// CREATE EXPENSE
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, paidBy, participants } = req.body;

    if (!title || !amount || !paidBy || !participants) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      paidBy,
      participants,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully 🎉",
      data: expense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
