const Vendor = require('../models/vendor.model')
const { orderService, paymentService } = require('../services')

const pay = catchAsync(async function (req, res) {
    const data = {
      ...req.body,
      user: req.user._id,
      price: parseFloat(data.price),
    };
   
    const payment = await paymentService.paymentPlatform(data);

    res.status(201).send({
      message: "Order created successfully",
      data: {
        order,
      },
    });
});

module.exports = {
    pay
}