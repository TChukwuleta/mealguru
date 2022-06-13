/* eslint-disable prettier/prettier */
const { Coupon } = require("../models");
const ApiError = require("../helpers/ApiError");
const moment = require("moment");

const createCoupon = async (body, criteria) => {
  try {
    let coupon = await Coupon.findOne({ ...criteria });
    if (coupon) {
      const err = {
        code: 409,
        message: "Coupon already exists for this user",
      };
      throw err;
    }

    coupon = await Coupon.create(body);
    return JSON.parse(JSON.stringify(coupon));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const findOne = async (criteria) => {
  try {
    const coupon = await Coupon.findOne({ ...criteria }).populate(
      "meal",
      "name image price description"
    );
    return JSON.parse(JSON.stringify(coupon));
  } catch (error) {
    throw new ApiError(
      error.code || StatusCodes.SERVER_ERROR,
      error.message || error
    );
  }
};

const count = async (criteria = {}) => {
  return await Coupon.find(criteria).countDocuments();
};

const fetchCoupons = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  let coupons = await Coupon.find(criteria)
    .sort(sort)
    .limit(_limit)
    .populate("meal", "name image price description")
    .skip(_limit * (_page - 1));

  return { coupons, page: _page };
};

const deleteCoupon = async (couponId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  Object.assign(coupon, { isDeleted: true });
  await coupon.save();
  return coupon;
};

const validateCoupon = async (data) => {
  let { code, amount, vendor } = data;
  const coupon = await Coupon.findOne({
    code,
  });
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }
  if (coupon.type === "VENDOR" && coupon.vendor != vendor) {
    throw new ApiError(400, "Invalid Coupon");
  }
  if (moment(moment().format()).isAfter(moment(coupon.expiry).format())) {
    throw new ApiError(400, "Coupon is expired");
  }
  if (parseInt(coupon.maxCount) < 1) {
    throw new ApiError(400, "Coupon limit exceeded");
  }
  let discount;
  if (coupon.format === "PERCENT") {
    discount =
      parseFloat(amount) - parseFloat(coupon.value / 100) * parseFloat(amount);
  } else if (coupon.type === "amount") {
    discount = parseFloat(amount) - parseFloat(coupon.value);
  }
  return discount;
};

module.exports = {
  validateCoupon,
  deleteCoupon,
  fetchCoupons,
  createCoupon,
  findOne,
  count,
};
