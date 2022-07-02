const express = require("express");
const router = new express.Router();
const authController = require("../controllers/auth.controller");

const userRouter = require("./user.route.js");
const vendorRouter = require("./vendor.route.js");
const categoryRouter = require("./category.route.js");
const mealRouter = require("./meal.route.js");
const orderRouter = require("./order.route.js");
const couponRouter = require("./coupon.route.js");
const summaryRouter = require("./summary.route.js");
const menuRouter = require("./menu.route.js");
const authRouter = require("./auth.route.js");
const paymentRouter = require("./payment.route")
const TransactionRouter = require("./transaction.route")
router.post("/upload/files", authController.uploadImages);
router.use("/user", userRouter);
router.use("/vendor", vendorRouter);
router.use("/category", categoryRouter);
router.use("/meal", mealRouter);
router.use("/menu", menuRouter);
router.use("/order", orderRouter);
router.use("/coupon", couponRouter);
router.use("/summary", summaryRouter);
router.use("/auth", authRouter);
router.use("/pay", paymentRouter)
router.use("/txn", TransactionRouter)
module.exports = router;
