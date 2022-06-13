const express = require("express");

const SummaryController = require("../controllers/summary.controller");
const { authService } = require("../services");
const router = new express.Router();

router.get("/", [authService.validateToken], SummaryController.preList);

module.exports = router;
