const axios = require('axios')
const { vendorService } = require('./index')
const ApiError = require("../helpers/ApiError");


const getBanks = async () => {
    const { data } = await axios.get(`${process.env.PAYSTACK_URL}/bank`, {
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${process.env.PAYSTACK_SK}`
        }
    });
    return data.data
}

const createPaystackCustomerForVendor = async (body) => {
    const paystackBody = {
        type: "nuban",
        name: body.fullName,
        account_number: body.accountNumber,
        bank_code: body.bankCode,
        currency: "NGN"
    }
    const { data } = await axios.post(`${process.env.PAYSTACK_URL}/transferrecipient`, paystackBody, {
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${process.env.PAYSTACK_SK}`
        }
    });
    console.log(data)  
    if(body.shouldSaveDetails){
        const details = {
            accountNumber: body.accountNumber,
            bankCode: body.bankCode,
            bankName: body.bankName,
            recipientCode: data.data.recipient_code
        }
        await saveVendorBankDetails(details)
    }
    return data
}

const saveVendorBankDetails = async (body) => {
    const accountInfo = {
        accountNum: body.accountNumber,
        bankCode: body.bankCode,
        bankName: body.bankName,
        paystackRecipientCode: body.recipientCode
    }
    const { users } = await vendorService.fetchVendors({ _id: body.vendorId })
    if(!users){
        throw new ApiError(400, "User not found");
    }
    const updateVendor = await vendorService.updateVendorByUserId(users.user, accountInfo)
    if(!updateVendor){
        throw new ApiError(400, "Unable to add bank details. Please contact support.");
    }
    return updateVendor
}

module.exports = {
    getBanks,
    createPaystackCustomerForVendor,
    saveVendorBankDetails
}