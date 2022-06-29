const { Order, Vendor, User, Transaction } = require("../models");
const ApiError = require("../helpers/ApiError");

const findOne = async (criteria) => {
  try {
    const transaction = await Transaction.findOne({ ...criteria })
      .populate("vendor", "fullName phoneNumber email");
    return JSON.parse(JSON.stringify(transaction));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const count = async (criteria = {}) => {
  return await Order.find(criteria).countDocuments();
};

const updateTransaction = async (criteria, status) => {
  const transaction = await Transaction.findOne({ ...criteria });
  switch (status) {
    case "INITIATED":
        transaction.transactionStatus = "INITIATED";
        await transaction.save();
        return transaction;
    case "PROCESSING":
        transaction.transactionStatus = "PROCESSING";
        await transaction.save();
        return transaction;
    case "ABANDONED":
        transaction.transactionStatus= "ABANDONED";
        await transaction.save();
        return transaction;
    case "SUCCESS":
        transaction.transactionStatus = "SUCCESS";
        await transaction.save();
        return transaction;
    case "FAILED":
        transaction.transactionStatus = "FAILED";
        await transaction.save();
        return transaction;
    case "REVERSED":
        transaction.transactionStatus = "REVERSED";
        await transaction.save();
        return transaction;
    case "CANCELLED":
        transaction.transactionStatus = "CANCELLED";
        await transaction.save();
        return transaction;
  }
};

module.exports = {
  count,
  findOne,
  updateTransaction,
};
