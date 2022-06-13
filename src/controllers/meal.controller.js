const catchAsync = require("../helpers/catchAsync");
const { mealService, menuService } = require("../services");
const ApiError = require("../helpers/ApiError");
const pick = require("../helpers/pick");
const { Vendor, Menu } = require("../models");

const create = catchAsync(async function (req, res) {
  const criteria = { name: req.body.name, vendor: req.vendor._id };
  const data = {
    ...req.body,
    vendor: req.vendor,
  };
  const meal = await mealService.createMeal(req, data, criteria);
  const menu = await Menu.findOne({ _id: meal.menu });
  if (menu) {
    menu.mealCount++;
    await menu.save();
  }
  res.status(201).send({
    message: "Meal created successfully",
    data: {
      meal,
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

const preList = catchAsync(async function (req, res) {
  const options = pick(req.query, ["category", "menu"]);
  let vendor;
  const {
    user: { type },
  } = req;
  let criteria = {};
  switch (type) {
    case "VENDOR":
      vendor = await Vendor.findOne({ user: req.user._id });
      criteria = { vendor: vendor._id, isDeleted: false, ...options };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
    case "VENDOR_ASSISTANT":
      criteria = { vendor: req.user.vendor, isDeleted: false, ...options };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;

    case "USER":
    case "ADMIN":
    case "SUPER_ADMIN":
      const user = req.query.user;
      if (user) {
        vendor = await Vendor.findOne({ user });
      }
      criteria = { isDeleted: false, vendor, ...options };
      list(JSON.parse(JSON.stringify(criteria)), req, res);
      break;
  }
});

const edit = catchAsync(async function (req, res) {
  const meal = await mealService.updateMeal(req.params._id, req);

  res.status(200).send({
    message: "Meal updated successfully",
    data: {
      meal,
    },
  });
});

const duplicate = catchAsync(async function (req, res) {
  const criteria = {
    _id: req.body.meal,
    isDeleted: false,
  };
  let body = req.body;
  delete body.meal;
  let data = await mealService.findOne(criteria);
  if (!data || !data.meal) {
    throw new ApiError(404, "Meal not found");
  }
  let meal = data.meal;
  delete meal._id;

  const menu = await Menu.findOne({ _id: meal.menu });
  if (menu) {
    menu.mealCount++;
    await menu.save();
  }
  meal = await mealService.createMeal(
    req,
    { ...meal, ...body, name: `${meal.name}-Copy` },
    criteria,
    false
  );

  res.status(200).send({
    message: "Meal updated successfully",
    data: { meal },
  });
});

const list = catchAsync(async function (filter, req, res) {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { meals, page } = await mealService.fetchMeals(filter, options);
  const count = await mealService.count(filter);
  res.status(200).send({
    status: "success",
    message: "Meals Fetched successfully",
    data: {
      count,
      currentPage: page,
      meals,
    },
  });
});

const listOne = catchAsync(async function (req, res) {
  const data = await mealService.findOne({
    _id: req.params._id,
    isDeleted: false,
  });
  if (!data || !data.meal) {
    throw new ApiError(404, "Meal not found");
  }
  res.status(200).send({
    status: "success",
    message: "Meal fetched Successfully",
    data: {
      ...data,
    },
  });
});

const deleteMeal = catchAsync(async function (req, res) {
  const meal = await mealService.deleteMeal(req.params._id);

  res.status(200).send({
    message: "Meal deleted successfully",
    data: {
      meal,
    },
  });
});

module.exports = {
  create,
  edit,
  list,
  deleteMeal,
  listOne,
  preCreate,
  preList,
  duplicate,
};
