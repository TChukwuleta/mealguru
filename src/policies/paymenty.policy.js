const Joi = require("@hapi/joi");

const create = {
  body: Joi.object().keys({ 
    paymentType: Joi.string().required().messages({
      "string.empty": `Paument type cannot be an empty field`,
      "any.required": `payment type is a required field`,
    }),
    orderCode: Joi.string().required().messages({
      "string.empty": `Order code cannot be an empty field`,
      "any.required": `Order code is a required field`,
    }),
    amount: Joi.string().required().messages({
      "string.empty": `Amount cannot be an empty field`,
      "any.required": `Amount is a required field`,
    })
  }),
};

const verify = {
    body: Joi.object().keys({ 
      reference: Joi.string().required().messages({
        "string.empty": `Reference code cannot be an empty field`,
        "any.required": `Reference code is a required field`,
      })
    }),
  };

module.exports = {
  create,
  verify
};
