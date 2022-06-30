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

router.get(
  "/getvendordetails",
  authService.validateToken,
  VendorController.getVendorDetails
); 

router.get(
  "/getvendorassistant",
  authService.validateToken,
  VendorController.getVendorAssistantByVendor
); 

// VENDOR DASHBOARD
router.get(
  "/getorders/:limit",
  authService.validateToken,
  VendorController.getOrdersByVendor
)
router.get(
  "getorderbyid/:orderid",
  authService.validateToken,
  VendorController.getVendorOrderById
)

module.exports = router;
