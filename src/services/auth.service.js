/* eslint-disable prettier/prettier */
const { Order, Vendor, User, Token, Coupon } = require("../models");
const ApiError = require("../helpers/ApiError");
const pick = require("../helpers/pick");
const randomInt = require("random-int");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenService = require("../services/token.service");
const vendorService = require("../services/vendor.service");

const register = async (data) => {
  try {
    let user = await User.findOne({ email: data.email });
    if (user) {
      const err = {
        code: 400,
        message: "User with that email already exists",
      };
      throw err;
    }
    data.password = await bcrypt.hash(data.password, 10);
    data.pin = randomInt(100000, 999999);
    user = await User.create(data);
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }
  if (!user.accountConfirmed) {
    throw new ApiError(400, "Acount not activated");
  }
  await comparePassword(password, user);
  return user;
};

const comparePassword = async (entered, user) => {
  try {
    const result = await bcrypt.compare(entered, user.password);
    if (!result) {
      throw new ApiError(400, "Invalid email or password");
    }
    return result;
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "Invalid user");
    }
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const getUserById = async (_id) => {
  try {
    let vendor = null;
    const user = await User.findOne({ _id });
    if (!user) {
      throw new ApiError(400, "Invalid user");
    }

    if (user.type === "VENDOR") {
      vendor = await Vendor.findOne({ user }).populate(
        "restaurant.category",
        "name image slug"
      );
    }
    const data = {
      user: JSON.parse(JSON.stringify(user)),
      vendorDetails: vendor ? JSON.parse(JSON.stringify(vendor)) : undefined,
    };
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || error);
  }
};

const fetchUsers = async (criteria = {}, options = {}) => {
  const { sort = { createdAt: -1 }, limit, page } = options;

  const _limit = parseInt(limit, 10);
  const _page = parseInt(page, 10);

  const users = await User.find(criteria)
    .sort(sort)
    .limit(_limit)
    .populate("vendor")
    .skip(_limit * (_page - 1));

  return { users, page: _page };
};

const updateUserById = async (userId, updateBody) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  if (updateBody.email) {
    const check = await User.findOne({ email: updateBody.email });
    if (check) throw new ApiError(400, "Email already taken");
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const emailVerification = async (email) => {
  try {
    let user = await getUserByEmail(email);
    user = await updateUserById(user._id, { accountConfirmed: true });
    return user;
  } catch (error) {
    throw new ApiError(error.code || 500, error.message || "An error occured");
  }
};

const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      "resetPassword"
    );
    const user = await User.findById(resetPasswordTokenDoc.user);

    if (!user) {
      throw new ApiError(400, "Password reset failed");
    }
    await Token.deleteMany({ user: user.id, type: "resetPassword" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await updateUserById(user.id, {
      password: hashedPassword,
    });
    return updatedUser;
  } catch (error) {
    throw new ApiError(
      400,
      (error && error.message) || "Password reset failed"
    );
  }
};

const updatePassword = async (email, oldPassword, newPassword) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(401, "Incorrect email or password...");
    }
    await comparePassword(oldPassword, user);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserById(user.id, { password: hashedPassword });
  } catch (error) {
    throw new ApiError(401, error || "Password reset failed");
  }
};

const validateToken = function (req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) {
    throw new ApiError(400, "You need to attach a token");
  }
  const bearer = bearerHeader.split(" ");
  const [, token] = bearer;
  req.token = token;
  jwt.verify(req.token, process.env.JWT_SECRET_KEY, (err, authData) => {
    if (err) {
      throw new ApiError(400, err.toString());
    } else {
      req.user = authData.user; // Add User Id to request
      next();
    }
  });
};

const isVendor = async function (req, res, next) {
  if (req.user.type === "VENDOR") {
    const vendor = await vendorService.getVendorByUserId(req.user._id);
    req.vendor = vendor;
    next();
  } else {
    throw new ApiError(403, "You need to be an admin to access this route");
  }
};

const isNotUser = async function (req, res, next) {
  if (req.user.type === "USER") {
    throw new ApiError(403, "You are unauthorized to access this route");
  }
  next();
};

const isAdmin = function (req, res, next) {
  if (req.user.type === "ADMIN" || req.user.type === "SUPER_ADMIN") {
    next();
  } else {
    throw new ApiError(403, "You need to be an admin to access this route");
  }
};

const isSuperAdmin = function (req, res, next) {
  if (req.user.type === "SUPER_ADMIN") {
    next();
  } else {
    throw new ApiError(403, "You need to be super admin to access this route");
  }
};

const count = async (criteria = {}) => {
  return await User.find(criteria).countDocuments();
};

module.exports = {
  register,
  login,
  emailVerification,
  validateToken,
  updateUserById,
  getUserByEmail,
  resetPassword,
  updatePassword,
  isVendor,
  isAdmin,
  isNotUser,
  getUserById,
  isSuperAdmin,
  fetchUsers,
  count,
};
