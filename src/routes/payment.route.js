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
  "/verifypayment",
  [authService.validateToken, validate(PaymentPolicies.verify)],
  PaymentController.verifyPayment
);

module.exports = router;
