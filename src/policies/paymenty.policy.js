const Joi = require("@hapi/joi");

const create = {
  body: Joi.object().keys({ 
    paymentType: Joi.string().required().messages({
      "string.empty": `Payment type cannot be an empty field`,
      "any.required": `payment type is a required field`,
    }),
    orderCode: Joi.string().required().messages({
      "string.empty": `Order code cannot be an empty field`,
      "any.required": `Order code is a required field`,
    }),
    amount: Joi.required().messages({
      "string.empty": `Amount cannot be an empty field`,
      "any.required": `Amount is a required field`,
    })
  }),
};

const withdraw = {
  body: Joi.object().keys({ 
    bankCode: Joi.string().required().messages({
      "string.empty": `Bank code cannot be an empty field`,
      "any.required": `Bank code is a required field`,
    }),
    accountNumber: Joi.string().required().messages({
      "string.empty": `Account number cannot be an empty field`,
      "any.required": `Account number is a required field`,
    }),
    amount: Joi.required().messages({
      "string.empty": `Amount cannot be an empty field`,
      "any.required": `Amount is a required field`,
    }),
    shouldSaveDetails: Joi.required().messages({
      "any.required": `Should save details is a required boolean field`,
    })
  }),
};

const verify = {
    body: Joi.object().keys({ 
      reference: Joi.string().required().messages({
        "string.empty": `Reference code cannot be an empty field`,
        "any.required": `Reference code is a required field`,
      }),
      type: Joi.string()
      .valid("TRANSACTION", "TRANSFER")
      .messages({
        "string.empty": `Type is a required field`,
        "any.only": `Invalid transaction type passed`,
      }),
    }),
}


module.exports = {
  create,
  withdraw,
  verify
};
