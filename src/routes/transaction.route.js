const express = require("express");

const TransactionController = require("../controllers/transaction.controller");
const PaymentPolicies = require("../policies/paymenty.policy");
const { authService } = require("../services");
const validate = require("../helpers/validate");
const router = new express.Router();

router.get(
  "/alltransactions",
  [authService.validateToken],
  TransactionController.allTransactions
);

router.get(
    "/allsuccessfultransactions",
    [authService.validateToken],
    TransactionController.allSuccessfulTransactions
);

router.get(
    "/alltransactionsbyvendor",
    [authService.validateToken],
    TransactionController.allTransactionsPerVendor
);


router.get(
    "/allsuccessfultransactionsbyvendor",
    [authService.validateToken],
    TransactionController.allSuccessfulTransactionsPerVendor
);


router.get(
    "/gettransactionbyid/:id",
    [authService.validateToken],
    TransactionController.findTransactionById
);

router.get(
    "/gettransactionbyreference/:reference",
    [authService.validateToken],
    TransactionController.findTransactionByReference
);


module.exports = router;
