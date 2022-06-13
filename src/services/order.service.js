const { Order, Vendor, User, Coupon } = require("../models");
const ApiError = require("../helpers/ApiError");
const emailHelper = require("../helpers/email");
const { EMAIL_CONTENT, EMAIL_HEADER } = require("../helpers/messages.js");
const slugify = require("slugify");

const createOrder = async (body) => {
  try {
    const order = await Order.create(data);
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const getOrderDetailsForEmail = async (orderId) => {
  let purchase = [];
  const order = await Order.findOne({
    _id: orderId,
  }).populate({
    path: "meals",
    populate: {
      path: "meal",
      model: "Meal",
    },
  });
  order.meals.forEach((meal) => {
    let temp = {};
    temp.name = meal.meal.name;
    temp.quantity = meal.quantity;
    purchase.push(temp);
  });
  return purchase;
};

const processCoupon = async ({ code, vendor }) => {
  let coupon = await Coupon.findOne({
    code,
    vendor,
  });
  if (coupon) {
    coupon.maxCount = parseInt(coupon.maxCount) - 1;
    coupon.save();
  }
};
const findOne = async (criteria) => {
  try {
    const order = await Order.findOne({ ...criteria })
      .populate({
        path: "meals.meal",
        model: "Meal",
        select: "name image price description",
      })
      .populate("user", "fullName phoneNumber email")
      .populate("vendor", "fullName phoneNumber email");
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const fetchOrders = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  let orders = await Order.find(criteria)
    .sort(sort)
    .limit(_limit)
    .populate({
      path: "meals.meal",
      model: "Meal",
      select: "name image price description",
    })
    .populate("user", "fullName phoneNumber email")
    .populate("vendor", "fullName phoneNumber email")
    .skip(_limit * (_page - 1));

  return { orders, page: _page };
};

const count = async (criteria = {}) => {
  return await Order.find(criteria).countDocuments();
};

const updateOrder = async (orderId, data) => {
  const { status, reason } = data;
  const order = await Order.findById(orderId);
  const vendor = await Vendor.findById(order.vendor);
  const user = await User.findOne(order.user);
  switch (status) {
    case "ACCEPTED":
      order.status = "ACCEPTED";
      await order.save();
      emailHelper.sendMealUpdate(
        user,
        EMAIL_CONTENT.ACCEPTED,
        EMAIL_HEADER.SUCCESS,
        order
      );
      return order;
    case "IN_TRANSIT":
      order.status = "IN_TRANSIT";
      await order.save();
      emailHelper.sendMealUpdate(
        user,
        EMAIL_CONTENT.TRANSIT,
        EMAIL_HEADER.SUCCESS,
        order
      );
      return order;
    case "DELIVERED":
      order.status = "DELIVERED";
      await order.save();
      emailHelper.sendMealUpdate(
        user,
        EMAIL_CONTENT.DELIVERED,
        EMAIL_HEADER.SUCCESS,
        order
      );
      return order;
    case "REJECTED":
      order.status = "REJECTED";
      order.rejected = reason;
      await order.save();
      emailHelper.sendMealUpdate(
        vendor,
        EMAIL_CONTENT.REJECTED,
        EMAIL_HEADER.FAILURE,
        order
      );
      return order;
    case "RECIEVED":
      order.status = "RECIEVED";
      await order.save();
      emailHelper.sendMealUpdate(
        vendor,
        EMAIL_CONTENT.RECIEVED,
        EMAIL_HEADER.FAILURE,
        order
      );
      return order;
  }

  // const data = req.body;
  // data.slug = slugify(data.name, { lower: true });

  // if (req.files && req.files.image) {
  //   const imageUrl = await processImages(req);
  //   data.image = imageUrl;
  // }

  // Object.assign(meal, data);
  // await meal.save();
  // return meal;
};

module.exports = {
  createOrder,
  getOrderDetailsForEmail,
  processCoupon,
  count,
  findOne,
  fetchOrders,
  updateOrder,
};
