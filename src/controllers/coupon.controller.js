const Coupon = require("../models/coupon.model.js");
const { couponService } = require("../services");
const catchAsync = require("../helpers/catchAsync");
const ApiError = require("../helpers/ApiError");
const pick = require("../helpers/pick");
const Vendor = require("../models/vendor.model.js");

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const create = catchAsync(async function (req, res, next) {
  const code = req.body.code ? req.body.code : randomString(8);
  const criteria = {
    code,
    vendor: req.vendor._id,
  };
  const data = { ...req.body, code, vendor: req.vendor._id };
  const coupon = await couponService.createCoupon(data, criteria);
  res.status(201).send({
    message: "Coupon created successfully",
    data: {
      coupon,
    },
  });
});

const preCreate = catchAsync(async function (req, res, next) {
  let vendor;
  const {
    user: { type },
  } = req;
  switch (type) {
    case "VENDOR":
      vendor = await Vendor.findOne({ user: req.user._id });
      req.body.type = "VENDOR";
      req.vendor = vendor;
      return create(req, res, next);
    case "ADMIN":
    case "SUPER_ADMIN":
      vendor = await Vendor.findOne({ user: req.body.user });
      if (!vendor) {
        throw new ApiError(400, "Invalid user passed");
      }
      req.body.type = "ADMIN";
      req.vendor = vendor;
      create(req, res, next);
  }
});

const preList = catchAsync(async function (req, res) {
  const filter = pick(req.query, ["meal"]);
  let vendor;
  const {
    user: { type },
  } = req;
  let criteria = {};
  switch (type) {
    case "VENDOR":
      vendor = await Vendor.findOne({ user: req.user._id });
      criteria = { vendor: vendor._id, isDeleted: false };
      list(criteria, req, res);
      break;
    case "ADMIN":
    case "SUPER_ADMIN":
      const user = req.query.user;
      if (user) {
        vendor = await Vendor.findOne({ user });
      }
      criteria = { isDeleted: false, vendor, ...filter };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
  }
});

const list = catchAsync(async function (filter, req, res) {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { coupons, page } = await couponService.fetchCoupons(filter, options);
  const count = await couponService.count(filter);
  res.status(200).send({
    status: "success",
    message: "Orders Fetched successfully",
    data: {
      count,
      currentPage: page,
      coupons,
    },
  });
});

const deleteCoupon = catchAsync(async function (req, res) {
  const coupon = await couponService.deleteCoupon(req.params._id);

  res.status(200).send({
    message: "Coupon deleted successfully",
    data: {
      coupon,
    },
  });
});

const validateCoupon = catchAsync(async function (req, res) {
  const discount = await couponService.validateCoupon(req.body);
  res.status(201).send({
    message: "Coupon applied successfully",
    data: {
      discount,
    },
  });
});

module.exports = {
  validateCoupon,
  list,
  deleteCoupon,
  create,
  preCreate,
  preList,
};
