const { Category } = require("../models");
const ApiError = require("../helpers/ApiError");
const cloudinaryHelper = require("../helpers/cloudinary");
const slugify = require("slugify");

const createCategory = async (req) => {
  let name = req.body.name;

  let category = await Category.findOne({ name });
  if (category) {
    const err = {
      code: 400,
      message: "Category already exists",
    };
    throw err;
  }
  const image = await processImages(req);
  const data = { name, image };
  data.slug = slugify(name, { lower: true });
  category = await Category.create(data);
  return JSON.parse(JSON.stringify(category));
};

const processImages = async (req) => {
  if (!req.files.image) {
    throw new ApiError(400, "You need to attach files");
  }
  const result = await cloudinaryHelper.uploadImage(req.files.image);
  return result.secure_url;
};

const findOne = async (criteria) => {
  try {
    const category = await Category.findOne({ ...criteria });
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const fetchCategories = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page, hide } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  let categories = await Category.find(criteria)
    .sort(sort)
    .limit(_limit)
    .skip(_limit * (_page - 1));

  return { categories, page: _page };
};

const count = async (criteria = {}) => {
  return await Category.find(criteria).countDocuments();
};

const updateCategory = async (categoryId, req) => {
  const category = await Category.findById(categoryId);
  if (!category || category.isDeleted) {
    throw new ApiError(404, "Category not found");
  }
  const data = req.body;
  data.slug = slugify(data.name, { lower: true });

  if (req.files && req.files.image) {
    const imageUrl = await processImages(req);
    data.image = imageUrl;
  }

  Object.assign(category, data);
  await category.save();
  return category;
};

const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  Object.assign(category, { isDeleted: true });
  await category.save();
  return category;
};
module.exports = {
  createCategory,
  findOne,
  processImages,
  fetchCategories,
  count,
  updateCategory,
  deleteCategory,
};
