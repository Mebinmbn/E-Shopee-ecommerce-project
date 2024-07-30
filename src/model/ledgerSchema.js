const mongoose = require("mongoose");

const { Schema } = mongoose;

const ledgerSchema = new Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
        message: {
          type: String,
        },
        type: {
          type: String,
          required: true,
          enum: ["Credit", "Debit"],
        },
        cBalance: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ledger", ledgerSchema);
