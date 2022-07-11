const Vendor = require('../models/vendor.model')
const catchAsync = require("../helpers/catchAsync");
const { orderService, paymentService, bankService } = require('../services')
 

const getBanks = catchAsync(async function(req, res) {
  const bankList = await bankService.getBanks()
  res.status(201).send({
    message: "Bank link retrieval successfully",
    data: {
      bankList
    },
  });
})

const pay = catchAsync(async function (req, res) {
    const data = {
      ...req.body,
      userId: req.user._id
    };
   
    const payment = await paymentService.paymentPlatform(data);

    res.status(201).send({
      message: "Payment created successfully",
      data: {
        payment
      },
    });
});

const withdrawMoney = catchAsync(async function (req, res) {
  const data = {
    ...req.body,
    userId: req.user._id
  };
 
  const payment = await paymentService.vendorWithdrawalWithPaystack(data);

  res.status(201).send({
    message: "Withdrawal created successfully",
    data: {
      payment
    },
  });
});

const verifyPayment = catchAsync(async function(req, res) {
  const verify = await paymentService.paystackVerify(req.body.reference)
  res.status(201).send({
    message: "Payment was successfully verified",
    data: {
      verify
    },
  });
})

module.exports = {
    pay,
    verifyPayment,
    withdrawMoney,
    getBanks
}