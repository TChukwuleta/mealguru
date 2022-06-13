const mongoose = require("mongoose");
const moment = require("moment");
let Schema = mongoose.Schema;

var restaurantSchema = new mongoose.Schema({
  name: {
    type: "string",
  },
  slug: {
    type: "string",
  },
  address: {
    type: "string",
  },
  openingHours: {
    type: "string",
  },
  closingHours: {
    type: "string",
  },
  delivery: {
    type: "string",
  },
  image: {
    type: String,
    trim: true,
  },
  workDays: {
    type: "string",
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
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

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = Restaurant;
