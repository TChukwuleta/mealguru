const mongoose = require("mongoose");

var adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    pin: {
      type: Number,
      trim: true,
    },
    type: {
      type: "string",
      enum: ["ADMIN", "SUPER-ADMIN"],
      default: "ADMIN",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const Admin = mongoose.model("Admin", adminSchema);

adminSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  },
});

module.exports = Admin;
