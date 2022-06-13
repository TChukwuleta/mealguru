const express = require("express");
const authController = require("../controllers/auth.controller");
const vendorController = require("../controllers/vendor.controller");
const { authService } = require("../services");

const router = express.Router();

router.get(
  "/all",
  [authService.validateToken, authService.isAdmin],
  authController.getUsers
);

router.get(
  "/vendors",
  [authService.validateToken],
  vendorController.getVendors
);

router.get("/", [authService.validateToken], authController.getUser);
module.exports = router;
