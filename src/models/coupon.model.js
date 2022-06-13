const mongoose = require("mongoose");
const moment = require("moment");
let Schema = mongoose.Schema;

var couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
  },
  format: {
    type: String,
    enum: ["PERCENT", "AMOUNT"],
  },
  type: {
    type: String,
    enum: ["VENDOR", "ADMIN"],
    default: "VENDOR",
  },
  meal: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meal" }],
  maxCount: {
    type: String,
    default: "50",
  },
  value: {
    type: String,
    required: true,
  },
  expiry: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: moment().format(),
  },
  updatedAt: {
    type: String,
    default: moment().format(),
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
