const Joi = require("@hapi/joi");
const JWT = require("jsonwebtoken");
const { decodeToken } = require("../config/jwt.js");

module.exports = {
  async validateToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader === "undefined") {
      res.status(401).send({
        message: "Access denied for user with no token",
      });
    } else {
      const bearer = bearerHeader.split(" ");
      req.token = bearer[1];
      let decode = await decodeToken(req.token);
      if (!decode) {
        return res
          .status(400)
          .send({ message: "Invalid token provided. Please login" });
      }
      req.user = decode.user;
      if (decode.user) {
        req.user = decode.user;

        next();
      } else {
        return res
          .status(401)
          .send({ message: "Only users can access this route" });
      }
    }
  },
  async validateRegister(req, res, next) {
    const schema = Joi.object({
      fullName: Joi.string().min(2).required().messages({
        "string.empty": `First name cannot be an empty field`,
        "string.min": `First name should have a minimum length of {#limit}`,
        "any.required": `First name is a required field`,
      }),
      phoneNumber: Joi.string().required().messages({
        "string.empty": `Phone Number cannot be an empty field`,
        "any.required": `Phone Number is a required field`,
      }),
      email: Joi.string().required().email().messages({
        "string.empty": `Email cannot be an empty field`,
        "any.required": `Email is a required field`,
        "string.email": `You need to enter a valid email`,
      }),
      password: Joi.string().min(6).max(20).required().messages({
        "string.empty": `Password cannot be an empty field`,
        "string.min": `Password should have a minimum length of {#limit}`,
        "string.max": `Password should have a maximum length of {#limit}`,
        "any.required": `Password is a required field`,
      }),
    }).unknown();
    try {
      const value = await schema.validateAsync(req.body);
      next();
    } catch (err) {
      err.details[0].type = err.details[0].context.key;
      res.status(400).send(err.details[0]);
    }
  },
  async validateRegister(req, res, next) {
    const schema = Joi.object({
      fullName: Joi.string().min(2).required().messages({
        "string.empty": `First name cannot be an empty field`,
        "string.min": `First name should have a minimum length of {#limit}`,
        "any.required": `First name is a required field`,
      }),
      phoneNumber: Joi.string().required().messages({
        "string.empty": `Phone Number cannot be an empty field`,
        "any.required": `Phone Number is a required field`,
      }),
      email: Joi.string().required().email().messages({
        "string.empty": `Email cannot be an empty field`,
        "any.required": `Email is a required field`,
        "string.email": `You need to enter a valid email`,
      }),
      password: Joi.string().min(6).max(20).required().messages({
        "string.empty": `Password cannot be an empty field`,
        "string.min": `Password should have a minimum length of {#limit}`,
        "string.max": `Password should have a maximum length of {#limit}`,
        "any.required": `Password is a required field`,
      }),
    }).unknown();
    try {
      const value = await schema.validateAsync(req.body);
      next();
    } catch (err) {
      err.details[0].type = err.details[0].context.key;
      res.status(400).send(err.details[0]);
    }
  },
};
