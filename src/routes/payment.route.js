const express = require("express");

const OrderController = require("../controllers/order.controller");
const PaymentPolicies = require("../policies/paymenty.policy");
const { authService } = require("../services");
const validate = require("../helpers/validate");
const router = new express.Router();

router.post(
  "/pay",
  [authService.validateToken, validate(PaymentPolicies.create)],
  OrderController.create
);
router.put(
  "/verifypayment",
  [authService.validateToken, validate(PaymentPolicies.verify)],
  OrderController.updateStatus
);

module.exports = router;
