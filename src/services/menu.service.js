const { Menu, Meal } = require("../models");
const ApiError = require("../helpers/ApiError");
const slugify = require("slugify");
const { crit } = require("../helpers/logger");

const createMenu = async (req, body, criteria) => {
  let name = body.name;
  try {
    let menu = await Menu.findOne({ ...criteria });
    const { vendor } = criteria;
    const count = await Menu.find({
      vendor,
      isDeleted: false,
    }).countDocuments();
    if (count && count > 49) {
      throw new ApiError(
        400,
        "Vendor cannot have more than 50 menu items at a time"
      );
    }
    if (menu) {
      throw new ApiError(400, "Menu already exists for this user");
    }

    const data = { ...body };
    data.slug = slugify(name, { lower: true });
    menu = await Menu.create(data);
    return JSON.parse(JSON.stringify(menu));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const findOne = async (criteria) => {
  try {
    const menu = await Menu.findOne({ ...criteria });
    const meals = await Meal.find({ isDeleted: false, menu });
    return JSON.parse(JSON.stringify({ menu, meals }));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const fetchMenus = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  let menus = await Menu.find(criteria)
    .sort(sort)
    .limit(_limit)
    .populate("vendor", "fullName restaurant.name restaurant.address")
    .skip(_limit * (_page - 1));

  return { menus, page: _page };
};

const count = async (criteria = {}) => {
  return await Menu.find(criteria).countDocuments();
};

const updateMenu = async (menuId, req) => {
  const menu = await Menu.findById(menuId);
  if (!menu || menu.isDeleted) {
    throw new ApiError(404, "Menu not found");
  }
  const data = req.body;
  data.slug = slugify(data.name, { lower: true });

  Object.assign(menu, data); 
  await menu.save();
  return menu;
};

const deleteMenu = async (menuId) => {
  const menu = await Menu.findById(menuId);
  if (!menu) {
    throw new ApiError(404, "Menu not found");
  }

  Object.assign(menu, { isDeleted: true });
  await menu.save();
  return menu;
};
module.exports = {
  createMenu,
  findOne,
  fetchMenus,
  count,
  updateMenu,
  deleteMenu,
};
