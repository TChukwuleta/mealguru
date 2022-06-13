const express = require("express");

const MealController = require("../controllers/meal.controller");
const MealPolicies = require("../policies/meal.policy");
const { authService } = require("../services");
const validate = require("../helpers/validate");
const router = new express.Router();

router.post(
  "/create",
  [authService.validateToken, validate(MealController.create)],
  MealController.preCreate
);

router.get("/list/all", [authService.validateToken], MealController.preList);
router.put(
  "/update/:_id",
  [
    authService.validateToken,
    authService.isNotUser,
    validate(MealPolicies.create),
  ],
  MealController.edit
);
router.post(
  "/duplicate",
  [authService.validateToken, authService.isNotUser],
  validate(MealPolicies.duplicate),
  MealController.duplicate
);
router.get("/list/:_id", [authService.validateToken], MealController.listOne);
router.delete(
  "/delete/:_id",
  [authService.validateToken, authService.isNotUser],
  MealController.deleteMeal
);

module.exports = router;
