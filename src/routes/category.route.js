const express = require("express");

const CategoryController = require("../controllers/category.controller");
const CategoryPolicies = require("../policies/category.policy");
const validate = require("../helpers/validate");
const { authService } = require("../services");
const router = new express.Router();

router.post(
  "/create",
  [
    validate(CategoryPolicies.create),
    authService.validateToken,
    authService.isAdmin,
  ],
  CategoryController.create
);
router.get("/list/all", [authService.validateToken], CategoryController.list);
router.put(
  "/update/:_id",
  [authService.validateToken, authService.isAdmin],
  CategoryController.edit
);
router.get(
  "/list/:_id",
  [authService.validateToken],
  CategoryController.listOne
);
router.delete(
  "/delete/:_id",
  [authService.validateToken, authService.isAdmin],
  CategoryController.deleteCategory
);

module.exports = router;
