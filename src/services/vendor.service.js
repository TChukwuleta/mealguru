/* eslint-disable prettier/prettier */
const { Vendor } = require("../models");
const ApiError = require("../helpers/ApiError");

const updateVendorByUserId = async (userId, updateBody) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new ApiError(400, "User not found");
  }
  Object.assign(vendor, updateBody);
  await vendor.save();
  return vendor;
};

const createVendor = async (userId) => {
  const vendor = await Vendor.create({ user: userId });
  return JSON.parse(JSON.stringify(vendor));
};

const getVendorByUserId = async (userId) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new ApiError(400, "User not found");
  }

  return vendor;
};

const fetchVendors = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  const users = await Vendor.find(criteria)
    .sort(sort)
    .limit(_limit)
    .populate("user")
    .skip(_limit * (_page - 1));

  return { users, page: _page };
};

const count = async (criteria = {}) => {
  return await Vendor.find(criteria).countDocuments();
};

module.exports = {
  updateVendorByUserId,
  createVendor,
  getVendorByUserId,
  fetchVendors,
  count,
};
