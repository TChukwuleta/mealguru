const express = require("express");
const validate = require("../helpers/validate");
const authController = require("../controllers/auth.controller");
const authValidation = require("../policies/auth.policy");
const { authService } = require("../services");

const router = express.Router();

router.post(
  "/register",
  [validate(authValidation.register)],
  authController.register
);

router.post(
  "/register/assistant",
  [
    validate(authValidation.register),
    authService.validateToken,
    authService.isVendor,
  ],
  authController.registerVendorAssistant
);

router.post(
  "/register/admin",
  [
    validate(authValidation.register),
    authService.validateToken,
    authService.isSuperAdmin,
  ],
  authController.registerAdmin
);

router.post("/login", [validate(authValidation.login)], authController.login);
module.exports = router;

router.get(
  "/account/confirm",
  [authService.validateToken],
  authController.emailVerification
);

router.post(
  "/user/confirm",
  [authService.validateToken],
  authController.pinVerification
);

router.get(
  "/account/resend",
  [authService.validateToken],
  authController.resendToken
);

router.post(
  "/forgot/password",
  [validate(authValidation.forgotPassword)],
  authController.forgotPassword
);

router.post(
  "/reset/password",
  [validate(authValidation.resetPassword)],
  authController.resetPassword
);

router.put(
  "/update/password",
  [validate(authValidation.updatePassword), authService.validateToken],
  authController.updatePassword
);

router.put(
  "/update/user",
  [authService.validateToken],
  authController.updateUserById
);

router.get(
  "/users",
  [authService.validateToken, authService.isAdmin],
  authController.getUsers
);

router.get("/", [authService.validateToken], authController.getUser);
module.exports = router;
