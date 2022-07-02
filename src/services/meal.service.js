const { Meal, Coupon } = require("../models");
const ApiError = require("../helpers/ApiError");
const cloudinaryHelper = require("../helpers/cloudinary");
const slugify = require("slugify");

const createMeal = async (req, body, criteria, checkCriteria = true) => {
  let name = body.name;
  try {
    let meal = await Meal.findOne({ ...criteria });
    if (meal && checkCriteria) {
      const err = {
        code: 400,
        message: "Meal already exists for this user",
      };
      throw err;
    }
    let image;
    if (req.files && req.files.image) {
      image = await processImages(req);
    }
    const data = { ...body, image };
    data.slug = slugify(name, { lower: true });
    meal = await Meal.create(data);
    return JSON.parse(JSON.stringify(meal));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const processImages = async (req) => {
  console.log(req.files)
  const result = await cloudinaryHelper.uploadImage(req.files.image);
  console.log(result)
  return result.secure_url;
};

const findOne = async (criteria) => {
  try {
    const meal = await Meal.findOne({ ...criteria });
    console.log(meal)
    const coupon = await Coupon.find({ meal });
    const data = { meal, coupon }; 
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const fetchMeals = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  let meals = await Meal.find(criteria)
    .sort(sort)
    .limit(_limit)
    .populate("category", "name image slug")
    .populate("menu", "name image")
    .populate("vendor", "fullName restaurant.name restaurant.address")
    .skip(_limit * (_page - 1));

  return { meals, page: _page };
};

const count = async (criteria = {}) => {
  return await Meal.find(criteria).countDocuments();
};

const updateMeal = async (mealId, req) => {
  const meal = await Meal.findById(mealId);
  if (!meal || meal.isDeleted) {
    throw new ApiError(404, "Meal not found");
  }
  const data = req.body;
  data.slug = slugify(data.name, { lower: true });

  if (req.files && req.files.image) {
    const imageUrl = await processImages(req);
    data.image = imageUrl;
  }

  Object.assign(meal, data);
  await meal.save();
  return meal;
};

const deleteMeal = async (mealId) => {
  const meal = await Meal.findById(mealId);
  if (!meal) {
    throw new ApiError(404, "Meal not found");
  }

  Object.assign(meal, { isDeleted: true });
  await meal.save();
  return meal;
};
module.exports = {
  createMeal,
  findOne,
  processImages,
  fetchMeals,
  count,
  updateMeal,
  deleteMeal,
};
