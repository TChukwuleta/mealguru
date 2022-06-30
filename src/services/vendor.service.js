/* eslint-disable prettier/prettier */
const { Order, Vendor } = require("../models");
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

const getOrdersByVendor = async (userId, orderLimit) => {
  const vendorOrders = await Order.find({ vendor: userId }).sort({ 'createdAt': -1 })
  if(!vendorOrders){
    throw new ApiError(400, "No orders exist with this vendor")
  }
  if(orderLimit > 0){
    return vendorOrders.limit(orderLimit)
  }
  return vendorOrders
}

const getVendorOrderById = async (userId, orderId) => {
  const order = await Order.find({ vendor: userId, _id: orderId })
  if(!order){
    throw new ApiError(400, "No order exist with that Id")
  }
  return order
}

const getVendorAssistantByVendor = async (vendorId) => {
  const vendorAssistant = await Vendor.find({ _id: vendorId })
}

const vendorDashboardCards = async (userId) => {
  const vendorOrder = await Order.find({ vendor: userId })
  if(!vendorOrder){
    throw new ApiError(400, "No order exist for this vendor")
  }
  const vendorOrders = await Order.find({ vendor: userId }).countDocuments()
  const vendorDeliveriesCount = await Order.find({ vendor: userId, type: "DELIVERY" }).countDocuments()
  const vendorPickupCount = await Order.find({ vendor: userId, type: "PICKUP" }).countDocuments()
  return {
    vendorOrders,
    vendorDeliveriesCount,
    vendorPickupCount
  }
}

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
  getOrdersByVendor,
  getVendorOrderById,
  vendorDashboardCards,
  fetchVendors,
  count,
};
