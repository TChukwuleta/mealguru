const mongoose = require("mongoose");
const moment = require("moment");
let Schema = mongoose.Schema;

var orderSchema = new mongoose.Schema({
  code: {
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
  type: {
    type: "string",
    enum: ["DELIVERY", "PICKUP"],
    default: "DELIVERY",
  },
  timing: {
    type: "string",
    enum: ["INSTANT", "SCHEDULED"],
    default: "INSTANT",
  },
  price: {
    type: Number,
    required: true,
  },
  reason: {
    type: "string",
  },
  meals: [
    {
      meal: {
        type: Schema.Types.ObjectId,
        ref: "Meal",
      },
      quantity: { type: Number, default: 1 },
    },
  ],
  deliveryDetails: {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    phoneNumber: {
      type: "string",
    },
  },

  coupon: {
    type: "string",
  },
  status: {
    type: "string",
    enum: [
      "PENDING",
      "ACCEPTED",
      "IN_TRANSIT",
      "DELIVERED",
      "REJECTED",
      "RECIEVED",
    ],
    default: "PENDING",
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

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
