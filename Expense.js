const mongoose = require("mongoose");

// Expense Schema
const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // future-proofing
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Create model
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
