const mongoose = require("mongoose");
const moment = require("moment");
let Schema = mongoose.Schema;

var mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  status: {
    type: "string",
    enum: ["AVAILABLE", "UNAVAILABLE"],
    default: "AVAILABLE",
  },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  vendor: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  menu: {
    type: Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  orderCount: {
    type: Number,
    default: 0,
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

const Meal = mongoose.model("Meal", mealSchema);

module.exports = Meal;
