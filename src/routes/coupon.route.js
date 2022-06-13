const express = require("express");

const CouponController = require("../controllers/coupon.controller");
const CouponPolicy = require("../policies/coupon.policy");
const { authService } = require("../services");
const router = new express.Router();

router.post(
  "/create",
  [authService.validateToken, CouponPolicy.validateCreate],
  CouponController.preCreate
);
router.post(
  "/apply",
  [authService.validateToken],
  CouponController.validateCoupon
);
router.delete(
  "/delete/:_id",
  [authService.validateToken],
  CouponController.deleteCoupon
);
router.get("/list/all", [authService.validateToken], CouponController.preList);

module.exports = router;
