const { Order, Vendor, Transaction, User } = require('../models')
const { orderService, vendorService } = require('./index')
const transactionService = require("./transaction.service")
const bankService = require('./bank.service')
const ApiError = require("../helpers/ApiError");
const axios = require("axios")
const _ = require("lodash")
const urlParams = require('url')
const qs = require('qs')
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
        const { data } = await axios.post(`${process.env.PAYSTACK_URL}/transaction/initialize`, form, {
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
                amount: parseInt(body.amount)
            })
        }
        return { data, newTransaction }

    } catch (error) {
        throw new ApiError(error.code || 500, error.message || error); 
    }
}

const paystackVerify = async (txref, transactionType) => {
    const existingTransaction = await transactionService.findTransaction({ transactionReference: txref })
    if(!existingTransaction) throw new ApiError(400, "Transaction with that reference does not exist")
    switch (transactionType) {
        case "transfer":
            await transactionService.updateTransaction({ transactionReference: txref }, "SUCCESS")
        case "transaction":
            await transactionService.updateTransaction({ transactionReference: txref }, "SUCCESS")
    }
    const url = `${process.env.PAYSTACK_URL}/transaction/verify/` + encodeURIComponent(txref)
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

const vendorWithdrawalWithPaystack = async (body) => {
    const vendorUser = await User.findOne({ _id: body.userId })
    if(!vendorUser) throw new ApiError(400, "Invalid user details")
    const vendor = await vendorService.getVendorByUserId(body.userId)
    if(!vendor) throw new ApiError(400, "Vendor does not exist")
    const requestPayload = {
        fullName: vendorUser.fullName,
        bankCode: body.bankCode,
        accountNumber: body.accountNumber,
        shouldSaveDetails: body.shouldSaveDetails,
        userId: body.userId
    }
    const response = await createPaystackCustomerForVendor(requestPayload)
    console.log(response.data.recipient_code) 
    const form = {
        source: 'balance',
        recipient: response.data.recipient_code,
        amount: (body.amount * 100),
        currency: "NGN",
        reason: `Vendor withdrawal`  
    }
    console.log(form)
    const { data } = await axios.post(`${process.env.PAYSTACK_URL}/transfer`, qs.stringify(form), {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            authorization: `Bearer ${process.env.PAYSTACK_SK}`
        }
    });
    console.log(`Second ${data}`) 
    if(data.status){
        newTransaction = await Transaction.create({
            vendor: vendor._id,
            user: vendor.user,
            transactionReference: data.data.reference,
            transactionStatus: data.data.status = "success" ? "SUCCESS" : "PROCESSING",
            transactionType: "DEBIT",
            amount: parseInt(body.amount)
        })
    }
    return { data, newTransaction }
}


const createPaystackCustomerForVendor = async (body) => {
    const paystackBody = {
        type: "nuban",
        name: body.fullName,
        account_number: body.accountNumber,
        bank_code: body.bankCode,
        currency: "NGN",
    }  
    const { data } = await axios.post(`${process.env.PAYSTACK_URL}/transferrecipient`, qs.stringify(paystackBody), {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            authorization: `Bearer ${process.env.PAYSTACK_SK}`
        }
    });
    console.log("Point A")
    if(body.shouldSaveDetails){
        const details = {
            accountNumber: body.accountNumber,
            bankCode: body.bankCode,
            bankName: body.bankName,
            recipientCode: data.data.recipient_code,
            userId: body.userId
        }
        await saveVendorBankDetails(details)
    }
    console.log("Point B")
    return data
}

const saveVendorBankDetails = async (body) => {
    const accountInfo = {
        accountNum: body.accountNumber,
        bankCode: body.bankCode,
        bankName: body.bankName,
        paystackRecipientCode: body.recipientCode
    }
    const saveVendorsDetails = await vendorService.updateVendorByUserId(body.userId, { accountInfo })
}


module.exports = {
    paymentPlatform,
    paystackVerify,
    vendorWithdrawalWithPaystack
}