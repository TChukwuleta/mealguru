const randomstring = require("randomstring");
const emailHelper = require("../helpers/email");
const Vendor = require("../models/vendor.model.js");
const { orderService, mealService } = require("../services");
const catchAsync = require("../helpers/catchAsync");
const pick = require("../helpers/pick");
const ApiError = require("../helpers/ApiError");
const moment = require("moment");

const create = catchAsync(async function (req, res) {
  const data = {
    ...req.body,
    code: `${randomstring.generate(6)}`,
    user: req.user._id,
    price: parseFloat(data.price),
  };

  const order = await orderService.createOrder(data);
  const purchase = await orderService.getOrderDetailsForEmail(order._id);

  let vendor = await Vendor.findOne({ _id: order.vendor });
  emailHelper.sendVendorPurchase(
    req.user,
    vendor,
    purchase,
    order.price,
    vendor.restaurant.name
  );
  emailHelper.sendUserPurchase(req.user, purchase, vendor.restaurant.name);

  const meals = req.body.meals;
  await meals.map(async (meal) => {
    let ml = await mealService.findOne(meal);
    ml.orderCount++;
    await ml.save();
    return ml;
  });

  if (data.coupon) {
    await orderService.processCoupon({
      code: data.coupon,
      vendor: order.vendor,
    });
  }
  res.status(201).send({
    message: "Order created successfully",
    data: {
      order,
    },
  });
});

const listOne = catchAsync(async function (req, res) {
  const order = await orderService.findOne({
    _id: req.params._id,
    isDeleted: false,
  });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  res.status(200).send({
    status: "success",
    message: "Order fetched Successfully",
    data: {
      order,
    },
  });
});

const preList = catchAsync(async function (req, res) {
  const filter = pick(req.query, ["type", "status"]);
  let vendor;
  const {
    user: { type },
  } = req;
  const dates = {
    from: req.query.from
      ? moment(req.query.from).format()
      : moment("1999-10-29").format(),
    to: req.query.to ? moment(req.query.to).format() : moment().format(),
  };
  let criteria = {};
  switch (type) {
    case "VENDOR":
      vendor = await Vendor.findOne({ user: req.user._id });
      criteria = {
        vendor: vendor._id,
        isDeleted: false,
        createdAt: { $gte: dates.from, $lte: dates.to },
        ...filter,
      };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
    case "VENDOR_ASSISTANT":
      criteria = {
        vendor: req.user.vendor,
        isDeleted: false,
        createdAt: { $gte: dates.from, $lte: dates.to },
        ...filter,
      };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
    case "ADMIN":
    case "SUPER_ADMIN":
      const user = req.query.user;
      if (user) {
        vendor = await Vendor.findOne({ user });
      }
      criteria = {
        isDeleted: false,
        vendor,
        createdAt: { $gte: dates.from, $lte: dates.to },
        ...filter,
      };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
  }
});

const list = catchAsync(async function (filter, req, res) {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { orders, page } = await orderService.fetchOrders(filter, options);
  const count = await orderService.count(filter);
  res.status(200).send({
    status: "success",
    message: "Menu Fetched successfully",
    data: {
      count,
      currentPage: page,
      orders,
    },
  });
});

const updateStatus = catchAsync(async function (req, res) {
  const order = await orderService.updateOrder(req.params._id, req.body);

  res.status(200).send({
    message: "Order updated successfully",
    data: {
      order,
    },
  });
});

module.exports = {
  create,
  listOne,
  updateStatus,
  list,
  preList,
};
