const catchAsync = require("../helpers/catchAsync");
const { menuService } = require("../services");
const ApiError = require("../helpers/ApiError");
const pick = require("../helpers/pick");
const { Vendor } = require("../models");

const create = catchAsync(async function (req, res, next) {
  const criteria = { name: req.body.name, vendor: req.vendor._id };
  const data = {
    ...req.body,
    vendor: req.vendor._id,
  };
  const menu = await menuService.createMenu(req, data, criteria);
  return res.status(201).send({
    message: "Menu created successfully",
    data: {
      menu,
    },
  });
});

const preCreate = catchAsync(async function (req, res, next) {
  let vendor;
  const {
    user: { type },
  } = req;
  switch (type) {
    case "VENDOR":
      vendor = await Vendor.findOne({ user: req.user._id });
      req.vendor = vendor;
      return create(req, res, next);
    case "VENDOR_ASSISTANT":
      req.vendor = req.user.vendor;
      return create(req, res, next);
    case "ADMIN":
    case "SUPER_ADMIN":
      vendor = await Vendor.findOne({ user: req.body.user });
      if (!vendor) {
        throw new ApiError(400, "Invalid user passed");
      }
      req.vendor = vendor;
      create(req, res, next);
  }
});

const edit = catchAsync(async function (req, res) {
  const menu = await menuService.updateMenu(req.params._id, req);

  res.status(200).send({
    message: "Menu updated successfully",
    data: {
      menu,
    },
  });
});

const preList = catchAsync(async function (req, res) {
  let vendor;
  const {
    user: { type },
  } = req;
  let criteria = {};
  switch (type) {
    case "VENDOR":
      vendor = await Vendor.findOne({ user: req.user._id });
      criteria = { vendor: vendor._id, isDeleted: false };
      list(criteria, req, res);
      break;
    case "VENDOR_ASSISTANT":
      criteria = { vendor: req.user.vendor, isDeleted: false, ...options };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
    case "ADMIN":
    case "SUPER_ADMIN":
      const user = req.query.user;
      if (user) {
        vendor = await Vendor.findOne({ user: req.user._id });
      }
      criteria = { isDeleted: false, vendor };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
  }
});

const list = catchAsync(async function (filter, req, res) {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { menus, page } = await menuService.fetchMenus(filter, options);
  const count = await menuService.count(filter);
  res.status(200).send({
    status: "success",
    message: "Menu Fetched successfully",
    data: {
      count,
      currentPage: page,
      menus,
    },
  });
});

const listOne = catchAsync(async function (req, res) {
  const data = await menuService.findOne({
    _id: req.params._id,
    isDeleted: false,
  });
  if (!data || !data.menu) {
    throw new ApiError(404, "Menu not found");
  }
  res.status(200).send({
    status: "success",
    message: "Menu fetched Successfully",
    data: {
      ...data,
    },
  });
});

const deleteMenu = catchAsync(async function (req, res) {
  const menu = await menuService.deleteMenu(req.params._id);

  res.status(200).send({
    message: "Menu deleted successfully",
    data: {
      menu,
    },
  });
});

module.exports = {
  edit,
  list,
  deleteMenu,
  listOne,
  preList,
  create,
  preCreate,
};
