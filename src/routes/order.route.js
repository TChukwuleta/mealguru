const express = require("express");

const OrderController = require("../controllers/order.controller");
const OrderPolicies = require("../policies/order.policy");
const { authService } = require("../services");
const validate = require("../helpers/validate");
const router = new express.Router();

router.post(
  "/create",
  [authService.validateToken, validate(OrderPolicies.create)],
  OrderController.create
);
router.put(
  "/update/:_id",
  [authService.validateToken],
  OrderController.updateStatus
);
router.get("/list/all", [authService.validateToken], OrderController.preList);
router.get("/:_id", [authService.validateToken], OrderController.listOne);
router.get("/getbycode/:code", [authService.validateToken], OrderController.getByCode);

module.exports = router;
