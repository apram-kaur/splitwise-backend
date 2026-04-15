console.log("Expense model loaded");

const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

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

    category: {
      type: String,
      default: "General",
    },

    isPaid: {
      type: Boolean,
      default: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    splitType: {
      type: String,
      enum: ["equal", "exact", "percentage"],
      default: "equal",
    },

    splits: [splitSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);