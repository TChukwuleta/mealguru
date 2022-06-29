const Vendor = require('../models/vendor.model')
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
        order,
      },
    });
});

module.exports = {
    pay
}