const { Order, Vendor, Transaction, User } = require('../models')
const { orderService } = require('./index')
const transactionService = require("./transaction.service")
const ApiError = require("../helpers/ApiError");
const axios = require("axios")
const _ = require("lodash")
const emailHelper = require("../helpers/email");
const { EMAIL_CONTENT, EMAIL_HEADER } = require("../helpers/messages.js");

const ticks = ((new Date().getTime() * 10000) + 621355968000000000);
const reference = `MealGuruu_${ticks}`
const paymentPlatform = async(body) => {
    try {
        const paymentTypeArray = ["paystack", "flutterwave"]
        const paymentChannel = body.paymentType.toString().toLowerCase()
        if(!paymentTypeArray.includes(paymentChannel)){
            throw new ApiError(400, "Please provide a valid payment type")
        }
        if(paymentChannel === "paystack"){
            return await paystackPayment(body)
        }
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error); 
    }
}

const paystackPayment = async (body) => {
    try {
        const order = await orderService.findByCode({ code: body.orderCode })
        if(!order){
            throw new ApiError(400, "Invalid order code")
        }
        const form = _.pick(body, ["amount"])
        form.email = order.user.email
        form.reference = reference
        form.fullname= order.user.fullName
        form.metadata = {
            fullname: form.fullname,
        };
        form.amount *= 100
        let newTransaction;
        const { data } = await axios.post(`${process.env.PAYSTACK_INITIALIZE}`, form, {
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${process.env.PAYSTACK_SK}`
            }
        });
        if(data.status){
            newTransaction = await Transaction.create({
                orderCode: order.code,
                vendor: order.vendor,
                user: order.user._id,
                transactionReference: reference,
                transactionStatus: "PROCESSING",
                transactionType: "CREDIT",
                amount: parseFloat(body.amount).toFixed(2)
            })
        }
        return { data, newTransaction }

    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error); 
    }
}

const paystackVerify = async (txref) => {
    const existingTransaction = await transactionService.findTransaction({ transactionReference: txref })
    if(!existingTransaction) throw new ApiError(400, "Transaction with that reference does not exist")
    const url = `${process.env.PAYSTACK_VERIFY}` + encodeURIComponent(txref)
    const { data } = await axios.get(url, {
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${process.env.PAYSTACK_SK}`
        }
    });
    if(!data.status){
        await transactionService.updateTransaction({ transactionReference: txref }, "FAILED")
        throw new ApiError(400, "An error occured with this transaction. Please contact support")
    }

    console.log(data.data.status)
    switch (data.data.status) {
        case "processing":
            await transactionService.updateTransaction({ transactionReference: txref }, "PROCESSING")
            throw new ApiError(400, "Your transaction is not yet complete")
        case "abandoned":
            await transactionService.updateTransaction({ transactionReference: txref }, "ABANDONED")
            throw new ApiError(400, "Your transaction is not yet complete")
        case "success":
            await transactionService.updateTransaction({ transactionReference: txref }, "SUCCESS")
      }
    return data
}


module.exports = {
    paymentPlatform,
    paystackVerify
}