const Joi = require("@hapi/joi");

const create = {
  body: Joi.object().keys({ 
    name: Joi.string().min(2).required().messages({
      "string.empty": `Name cannot be an empty field`,
      "string.min": `Name should have a minimum length of {#limit}`,
      "any.required": `Name is a required field`,
    }),
    description: Joi.string().required().messages({
      "string.empty": `Description cannot be an empty field`,
      "any.required": `Description is a required field`,
    }),
    price: Joi.string().required().messages({
      "string.empty": `Price cannot be an empty field`,
      "any.required": `Price is a required field`,
    }),
    meals: Joi.required().messages({
      "string.empty": `Meal cannot be an empty array`,
      "any.required": `Menu is a required field`,
    }),
    menu: Joi.string().required().messages({
      "string.empty": `Menu cannot be an empty field`,
      "any.required": `Menu is a required field`,
    }),
    category: Joi.string().required().messages({
      "string.empty": `Category cannot be an empty field`,
      "any.required": `Category is a required field`,
    }),
    vendor: Joi.string().required().messages({
      "string.empty": `Category cannot be an empty field`,
      "any.required": `Category is a required field`,
    })
  }),
};

module.exports = {
  create,
};
