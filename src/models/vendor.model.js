const mongoose = require("mongoose");
let Schema = mongoose.Schema;

var vendorSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      default: {},
      name: {
        type: String,
      },
      slug: {
        type: String,
      },
      address: {
        type: String,
      },
      image: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      website: {
        type: String,
      },
      twitter: {
        type: String,
      },
      instagram: {
        type: String,
      },
      category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    },
    accountInfo: {
      accountNum: {
        type: String,
      },
      bankCode: {
        type: String,
      },
      bankName: {
        type: String,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
