const { Order, Vendor, Transaction, User } = require('../models')
const { orderService, transactionService } = require('./index')
const ApiError = require("../helpers/ApiError");
const emailHelper = require("../helpers/email");
const { EMAIL_CONTENT, EMAIL_HEADER } = require("../helpers/messages.js");
const request = require('request')

const ticks = ((new Date().getTime() * 10000) + 621355968000000000);
const reference = `MealGuruu_${ticks}`
const paymentPlatform = async(body) => {
    try {
        const paymentTypeArray = ["paystack", "flutterwave"]
        if(!paymentTypeArray.includes(body.paymentType.toLower())){
            throw new ApiError(400, "Please provide a valid payment type")
        }
        if(body.paymentType.toLower() === "paystack"){
            await paystackPayment(body)
        }
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error); 
    }
}

const paystackPayment = async (body) => {
    try {
        const order = await orderService.findOne({ code: body.orderCode })
        if(!order){
            throw new ApiError(400, "Invalid order code")
        }
        const amount = parseFloat(body.amount).toFixed(2)
        const requestBody = {
            amount,
            email: order.User.email,
            fullname: order.User.fullname
        }
        requestBody.metadata = {
            fullname: requestBody.fullname
        }
        requestBody.amount *= 100
        const paystackPayload = {
            url: `${process.env.PAYSTACK_INITIALIZE}`,
            headers: {
                authorization: `${process.env.PAYSTACK_SK}`,
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            requestBody
        }
        request.post(paystackPayload, async(error, response, body) => {
            if(error) throw new ApiError(400, `${error}`)
            const data = JSON.parse(body)
            const newTransaction = await Transaction.create({
                orderCode: order.code,
                vendor: order.vendor._id,
                user: order.user._id,
                transactionReference: reference,
                transactionStatus: "PROCESSING",
                transactionType: "CREDIT",
                amount: amount
            })
            return { data, newTransaction }
        })
    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error); 
    }
}

const paystackVerify = async (txref) => {
    const existingTransaction = await transactionService.findOne({ transactionReference: txref })
    if(!existingTransaction) throw new ApiError(400, "Transaction with that reference does not exist")
    const options = {
        url: `${process.env.PAYSTACK_VERIFY}` + encodeURIComponent(txref),
        headers: {
            authorization: `${process.env.PAYSTACK_SK}`,
            "content-type": "application/json",
            "cache-control": "no-cache",
        }
    }
    request(options, async(error, response, body) => {
        if(error) throw new ApiError(400, `${error}`)
        response = JSON.parse(body)
        if(!response.status){
            await transactionService.updateTransaction({ transactionReference: existingTransaction.transactionReference }, "FAILED")
            throw new ApiError(400, "An error occured with this transaction. Please contact support")
        }
        if(response.data.status == "abandoned" || response.data.status == "Abandoned"){
            await transactionService.updateTransaction({ transactionReference: existingTransaction.transactionReference }, "ABANDONED")
            throw new ApiError(400, "Your transaction is not yet complete")
        }
        await transactionService.updateTransaction({ transactionReference: existingTransaction.transactionReference }, "SUCCESS")
        return response.data;
    })
}


module.exports = {
    paymentPlatform,
    paystackVerify
}