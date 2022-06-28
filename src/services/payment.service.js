const { Order, Vendor, Transaction, User } = require('../models')
const ApiError = require("../helpers/ApiError");
const emailHelper = require("../helpers/email");
const { EMAIL_CONTENT, EMAIL_HEADER } = require("../helpers/messages.js");
const slugify = require("slugify");


const paymentPlatform = async(body) => {
    try {
        
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error); 
    }
}


module.exports = {
    paymentPlatform
}