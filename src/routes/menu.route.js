const express = require("express");

const MenuController = require("../controllers/menu.controller");
const MenuPolicies = require("../policies/menu.policy");
const { authService } = require("../services");
const validate = require("../helpers/validate");
const router = new express.Router();

router.post(
  "/create",
  [authService.validateToken, validate(MenuPolicies.create)],
  MenuController.preCreate
);
router.get("/list/all", authService.validateToken, MenuController.preList);
router.put(
  "/update/:_id",
  [
    authService.validateToken,
    authService.isNotUser,
    validate(MenuPolicies.create),
  ],
  MenuController.edit
);
router.get("/list/:_id", authService.validateToken, MenuController.listOne);
router.delete(
  "/delete/:_id",
  authService.validateToken,
  authService.isNotUser,
  MenuController.deleteMenu
);

module.exports = router;
