const cloudinaryHelper = require("../helpers/cloudinary");
const { vendorService } = require("../services");
const ApiError = require("../helpers/ApiError");
const { User, Order, Vendor } = require("../models");
const pick = require("../helpers/pick");
const catchAsync = require("../helpers/catchAsync");

const setupRestaurant = catchAsync(async (req, res) => {
  const data = { ...req.body };
  if (req.files) {
    let result = await cloudinaryHelper.uploadImage(req.files.image);
    data.image = result.secure_url;
  }
  const restaurant = { ...data };
  const vendor = await vendorService.updateVendorByUserId(req.user._id, {
    restaurant,
  });
  const user = await User.findOne({ _id: req.user });
  res.status(201).send({
    message: "Restaurant details updated successfully",
    data: {
      vendor,
      user,
    },
  });
});

const updateDetails = catchAsync(async (req, res) => {
  const accountInfo = { ...req.body };
  await vendorService.updateVendorByUserId(req.user._id, { accountInfo });
  res.status(201).send({
    message: "Account details updated successfully",
    data: {},
  });
});

const uploadImages = catchAsync(async (req, res) => {
  let result = await cloudinaryHelper.uploadImage(req.files.image);

  return res.status(200).send({
    message: "Image Uploaded successfully",
    image: result.secure_url,
  });
});


const getVendorDetails = catchAsync(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id })
  if(!vendor){
    throw new ApiError(400, "No vendor details found");
  }
  res.status(200).send({
    message: "Vendor retrieval was successful",
    data: vendor
  })
}) 

const getOrdersByVendor = catchAsync(async (req, res) => {
  const limit = req.params.limit
  const orders = await vendorService.getOrdersByVendor(req.user._id, limit)
  res.status(200).send({
    message: "Orders retrieval per Vendor was successful",
    data: orders
  })
})

const getVendorAssistantByVendor = catchAsync(async (req, res) => {
  const vendorId = req.user._id
  const vendorAssistants = await User.find({ vendor: vendorId })
  if(!vendorAssistants)throw new ApiError(400, "No vendor details found");
  res.status(200).send({
    message: "Vendor assistant retrieval was successful",
    data: vendorAssistants
  })
})

const getVendorOrderById = catchAsync(async (req, res) => {
  const orderId = req.params.orderid
  const order = await vendorService.getVendorOrderById(req.user._id, orderId)
  res.status(200).send({
    message: "Order retrieval by Id was successful",
    data: order
  })
})

const getVendorDashboardDetails = catchAsync(async (req, res) => {
  const { vendorOrders, vendorDeliveriesCount, vendorPickupCount } = await vendorService.getVendorDashboardDetails(req.user._id)
  const dashboardDetails = {
    Orders: vendorOrders,
    Deliveries: vendorDeliveriesCount,
    PickUp: vendorPickupCount,
    AsOf: new Date()
  }
  res.status(200).send({
    message: "Retrieving vendor's dashboard details was successful",
    data: dashboardDetails
  })
})

const getVendors = catchAsync(async (req, res) => {
  // const filter = {pick(req.query, ["type"]);}
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { users, page } = await vendorService.fetchVendors({}, options);
  const count = await vendorService.count();
  res.status(200).send({
    status: "success",
    message: "Users Fetched successfully",
    data: {
      count,
      currentPage: page,
      users,
    },
  });
});

module.exports = {
  setupRestaurant,
  updateDetails,
  uploadImages,
  getVendors,
  getOrdersByVendor,
  getVendorOrderById,
  getVendorDetails,
  getVendorAssistantByVendor
};
