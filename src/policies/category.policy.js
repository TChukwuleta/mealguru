const Joi = require("@hapi/joi");

const create = {
  body: Joi.object().keys({
    name: Joi.string().min(2).required().messages({
      "string.empty": `Name cannot be an empty field`,
      "string.min": `Name should have a minimum length of {#limit}`,
      "any.required": `Name is a required field`,
    }),
  }),
};

module.exports = {
  create,
};
