const { Router } = require("express");
const { param } = require("express-validator");

const router = Router();

const isAuth = require("../middlewares/check-auth");
const paymentController = require("../controllers/payment");

router.get(
  "/stripe/:orderId",
  isAuth,
  param("orderId").isMongoId(),
  paymentController.getStripe
);

router.get(
  "/paypal/:orderId",
  isAuth,
  param("orderId").isMongoId(),
  paymentController.getPayPal
);

module.exports = router;
