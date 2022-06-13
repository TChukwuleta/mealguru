const express = require("express");

const VendorController = require("../controllers/vendor.controller");
const { authService } = require("../services");
const router = new express.Router();

router.put(
  "/profile/update",
  authService.validateToken,
  VendorController.updateDetails
);

router.put(
  "/restaurant/setup",
  authService.validateToken,
  VendorController.setupRestaurant
);
router.post(
  "/uploads",
  authService.validateToken,
  VendorController.uploadImages
);

module.exports = router;
