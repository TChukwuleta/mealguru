const express = require("express");

const PaymentController = require("../controllers/payment.controller");
const PaymentPolicies = require("../policies/paymenty.policy");
const { authService } = require("../services");
const validate = require("../helpers/validate");
const router = new express.Router();

router.post(
  "/pay",
  [authService.validateToken, validate(PaymentPolicies.create)],
  PaymentController.pay
);
router.put(
  "/verifypayment",
  [authService.validateToken, validate(PaymentPolicies.verify)],
  PaymentController.pay
);

module.exports = router;
