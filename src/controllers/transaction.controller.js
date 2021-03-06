const { Vendor, Transaction } = require('../models')
const catchAsync = require("../helpers/catchAsync");
const { transactionService, paymentService } = require('../services')
 
const allTransactions = catchAsync(async function (req, res) {
    const transactions = await transactionService.findTransaction()

    res.status(201).send({
      message: "Transactions retrieval was successfully",
      data: {
        transactions
      },
    });
});

const allTransactionsPerVendor = catchAsync(async function (req, res) {
    const transactions = await transactionService.findTransaction({ vendor: req.user._id })

    res.status(201).send({
      message: "Transactions retrieval was successfully",
      data: {
        transactions
      },
    });
});

const allSuccessfulTransactionsPerVendor = catchAsync(async function (req, res) {
    const transactions = await transactionService.findTransaction({ vendor: req.user._id, transactionStatus: "SUCCESS" })

    res.status(201).send({
      message: "Transactions retrieval was successfully",
      data: {
        transactions
      },
    });
});

const allSuccessfulTransactions = catchAsync(async function (req, res) {
    const transactions = await transactionService.findTransaction({ transactionStatus: "SUCCESS" })

    res.status(201).send({
      message: "Transactions retrieval was successfully",
      data: {
        transactions
      },
    });
});

const findTransactionByReference = catchAsync(async function (req, res) {
    const transactions = await transactionService.findTransaction({ transactionReference: req.params.reference })

    res.status(201).send({
      message: "Transaction retrieval was successfully",
      data: {
        transactions
      },
    });
});

const findTransactionById = catchAsync(async function (req, res) {
    const transactions = await transactionService.findTransaction({ _id: req.params.id })

    res.status(201).send({
      message: "Transaction retrieval was successfully",
      data: {
        transactions
      },
    });
});

const totalMoneyForVendors = catchAsync(async function (req, res) {
  const moneySum = await transactionService.getVendorBalance()

  res.status(201).send({
    message: "Retrieving sum of money for all vendors was successfully",
    data: {
      moneySum
    },
  });
});

const totalMoneyPerVendors = catchAsync(async function (req, res) {
  const moneySum = await transactionService.getVendorBalance({ vendor: req.user._id })

  res.status(201).send({
    message: "Retrieving sum of money for a single vendor was successfully",
    data: {
      moneySum
    },
  });
});


module.exports = {
    allTransactions,
    allTransactionsPerVendor,
    allSuccessfulTransactionsPerVendor,
    allSuccessfulTransactions,
    findTransactionById,
    findTransactionByReference,
    totalMoneyForVendors,
    totalMoneyPerVendors
}