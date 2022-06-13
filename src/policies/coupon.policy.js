const Joi = require("@hapi/joi");
const JWT = require("jsonwebtoken");
const { decodeToken } = require("../config/jwt.js");

module.exports = {
  async validateCreate(req, res, next) {
    const schema = Joi.object({
      value: Joi.string().required().messages({
        "string.empty": `Value cannot be an empty field`,
        "any.required": `Value is a required field`,
      }),
      format: Joi.string().valid("PERCENT", "AMOUNT").required().messages({
        "string.empty": `Format is a required field`,
        "any.only": `Invalid format type passed`,
      }),
      expiry: Joi.string().required().messages({
        "string.empty": `Expiry Date is a required field`,
        "any.required": `Expiry Date is a required field`,
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
