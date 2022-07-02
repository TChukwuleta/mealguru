const Vendor = require('../models/vendor.model')
const catchAsync = require("../helpers/catchAsync");
const { orderService, paymentService } = require('../services')
 
const pay = catchAsync(async function (req, res) {
    const data = {
      ...req.body,
      userId: req.user._id
    };
   
    const payment = await paymentService.paymentPlatform(data);

    res.status(201).send({
      message: "Order created successfully",
      data: {
        payment
      },
    });
});

const verifyPayment = catchAsync(async function(req, res) {
  const verify = await paymentService.paystackVerify(req.body.reference)
  res.status(201).send({
    message: "Order created successfully",
    data: {
      verify
    },
  });
})

module.exports = {
    pay,
    verifyPayment
}