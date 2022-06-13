const Order = require("../models/order.model.js");
const catchAsync = require("../helpers/catchAsync");
const Vendor = require("../models/vendor.model.js");
const moment = require("moment");

const preList = catchAsync(async function (req, res, next) {
  let vendor;
  const {
    user: { type },
  } = req;
  let criteria = {};
  const dates = {
    from: req.query.from
      ? moment(req.query.from).format()
      : moment("1999-10-29").format(),
    to: req.query.to ? moment(req.query.to).format() : moment().format(),
  };
  switch (type) {
    case "VENDOR":
      vendor = await Vendor.findOne({ user: req.user._id });
      criteria = { vendor: vendor._id, isDeleted: false };
      req.data = { criteria, dates };
      list(req, res, next);
      break;
    case "ADMIN":
    case "SUPER_ADMIN":
      const user = req.query.user;
      if (user) {
        vendor = await Vendor.findOne({ user });
      }
      criteria = { isDeleted: false, vendor };
      req.data = { criteria: JSON.parse(JSON.stringify(criteria)), dates };
      list(req, res, next);
      break;
  }
});

const list = catchAsync(async function (req, res, next) {
  const { criteria, dates } = req.data;
  var orderCount = await Order.find({
    ...criteria,
    createdAt: { $gte: dates.from, $lte: dates.to },
  }).countDocuments();
  var deliveryCount = await Order.find({
    type: "DELIVERY",
    ...criteria,
    createdAt: { $gt: dates.from, $lt: dates.to },
  }).countDocuments();
  var pickupCount = await Order.find({
    type: "PICKUP",
    ...criteria,
    createdAt: { $gt: dates.from, $lt: dates.to },
  }).countDocuments();
  let latestOrders = await Order.find({
    ...criteria,
    createdAt: { $gt: dates.from, $lt: dates.to },
  })
    .sort({ createdAt: "asc" })
    .limit(5)
    .populate({
      path: "meals",
      populate: {
        path: "meal",
        model: "Meal",
      },
    });
  let total = await Order.find({
    ...criteria,
    createdAt: { $gt: dates.from, $lt: dates.to },
  });
  const allAmounts = total.map((order) => {
    return order.price;
  });
  const totalAmount = allAmounts.reduce(function (result, item) {
    return result + item;
  }, 0);

  res.status(200).send({
    status: "success",
    message: "Fetched successfully",
    data: {
      totalAmount: total && total.length > 0 ? totalAmount : 0,
      orderCount,
      deliveryCount,
      pickupCount,
      latestOrders,
    },
  });
});

module.exports = {
  list,
  preList,
};
