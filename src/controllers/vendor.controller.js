const cloudinaryHelper = require("../helpers/cloudinary");
const { vendorService } = require("../services");
const { User } = require("../models");
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
};
