const mongoose = require("mongoose");
const moment = require("moment");
let Schema = mongoose.Schema;

var transactionSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    required: true,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transactionStatus: {
    type: "string",
    enum: ["INITIATED", "PROCESSING", "SUCCESS", "FAILED", "REVERSED", "CANCELLED"],
    default: "INITIATED",
  },
  transactionReference: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: String,
    required: true,
    trim: true,
  },
  TransactionDate: {
    type: String,
    default: moment().format(),
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
