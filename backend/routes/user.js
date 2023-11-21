const { Router } = require("express");
const { body, param } = require("express-validator");

const router = Router();

const isAuth = require("../middlewares/check-auth");
const userController = require("../controllers/user");

router.get("/cart", isAuth, userController.getCart);

router.post(
  "/signup",
  [
    body("name").trim().isString().notEmpty(),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").trim().isString().isLength({ min: 6 }).isAlphanumeric(),
    body("confirmPassword")
      .isString()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords has to be matched!");
        }
        return true;
      }),
  ],
  userController.createUser
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().normalizeEmail(),
    body("password").trim().isString().isLength({ min: 6 }).isAlphanumeric(),
  ],
  userController.login
);

router.post("/:prodId", isAuth, userController.addToCart);

router.patch(
  "/shipping",
  isAuth,
  [
    body("address").trim().isString().notEmpty().isLength({ min: 10 }),
    body("city").trim().isString().not().isEmpty(),
    body("postalCode")
      .isNumeric()
      .custom((value) => {
        if (value.toString().length < 5) {
          throw new Error("Postal code should be at least 5 numbers.");
        }
        return true;
      }),
    body("country").trim().isString().notEmpty(),
  ],
  userController.saveAddress
);

router.delete(
  "/:prodId",
  isAuth,
  param("prodId").isMongoId(),
  userController.deleteFromCart
);

router.put(
  "/reset",
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  userController.restPassword
);

router.get("/password/reset/:passwordToken", userController.getNewPassword);

router.patch(
  "/password/new",
  [
    body("userId").isMongoId(),
    body("newPassword", "Password has to be valid.")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  userController.updatePassword
);

module.exports = router;
