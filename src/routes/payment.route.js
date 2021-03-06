const express = require("express");

const PaymentController = require("../controllers/payment.controller");
const PaymentPolicies = require("../policies/paymenty.policy");
const { authService } = require("../services");
const validate = require("../helpers/validate");
const router = new express.Router();

router.post(
  "/createpayment",
  [authService.validateToken, validate(PaymentPolicies.create)],
  PaymentController.pay
);

router.post(
  "/withdrawmoney",
  [authService.validateToken, validate(PaymentPolicies.withdraw)],
  PaymentController.withdrawMoney
);

router.post(
  "/verifypayment",
  [authService.validateToken, validate(PaymentPolicies.verify)],
  PaymentController.verifyPayment
);

router.get(
  "/getbanks",
  PaymentController.getBanks
);

module.exports = router;
