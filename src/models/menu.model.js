const mongoose = require("mongoose");
let Schema = mongoose.Schema;

var menuSchema = new mongoose.Schema(
  {
    name: {
      type: "string",
    },
    slug: {
      type: "string",
    },
    mealCount: {
      type: Number,
      default: 0,
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
  },
  { timestamps: true, versionKey: false }
);

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;
