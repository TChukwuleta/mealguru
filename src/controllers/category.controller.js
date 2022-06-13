const ApiError = require("../helpers/ApiError");
const catchAsync = require("../helpers/catchAsync");
const { categoryService } = require("../services");
const pick = require("../helpers/pick");

const create = catchAsync(async function (req, res) {
  const category = await categoryService.createCategory(req);
  res.status(201).send({
    message: "Category created successfully",
    data: {
      category,
    },
  });
});
const deleteCategory = catchAsync(async function (req, res) {
  const category = await categoryService.deleteCategory(req.params._id);

  res.status(200).send({
    message: "Category deleted successfully",
    data: {
      category,
    },
  });
});
const edit = catchAsync(async function (req, res) {
  const category = await categoryService.updateCategory(req.params._id, req);

  res.status(200).send({
    message: "Category updated successfully",
    data: {
      category,
    },
  });
});
const list = catchAsync(async function (req, res) {
  let filter = pick(req.query, ["status"]);
  filter = { ...filter, isDeleted: false };
  const options = pick(req.query, ["sortBy", "limit", "page", "hide"]);
  filter = JSON.parse(JSON.stringify(filter));
  const { categories, page } = await categoryService.fetchCategories(
    filter,
    options
  );
  const count = await categoryService.count(filter);
  res.status(200).send({
    status: "success",
    message: "Fetched successfully",
    data: {
      count,
      currentPage: page,
      categories,
    },
  });
});
const listOne = catchAsync(async function (req, res) {
  const category = await categoryService.findOne({
    _id: req.params._id,
    isDeleted: false,
  });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  res.status(200).send({
    status: "success",
    message: "Category fetched Successfully",
    data: {
      category,
    },
  });
});

module.exports = {
  create,
  edit,
  list,
  deleteCategory,
  listOne,
};
