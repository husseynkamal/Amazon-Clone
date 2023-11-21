const { Router } = require("express");
const { body, param } = require("express-validator");

const router = Router();

const isAuth = require("../middlewares/check-auth");
const orderController = require("../controllers/order");

router.post(
  "/",
  isAuth,
  [
    body("orderItems").isArray().notEmpty(),
    body("shippingAddress").isObject().notEmpty(),
    body("paymentMethod").isString().notEmpty(),
    body("itemsPrice").isNumeric(),
    body("shippingPrice").isNumeric(),
    body("totalPrice").isNumeric(),
  ],
  orderController.createOrder
);

router.get("/", isAuth, orderController.getOrders);

router.post(
  "/invoice",
  isAuth,
  [body("orderId").notEmpty().isMongoId()],
  orderController.getInvoice
);

router.get(
  "/:orderId",
  isAuth,
  param("orderId").isMongoId(),
  orderController.getOrder
);

module.exports = router;
