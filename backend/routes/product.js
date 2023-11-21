const { Router } = require("express");
const { body, param } = require("express-validator");

const router = Router();

const isAuth = require("../middlewares/check-auth");
const fileUpload = require("../middlewares/file-upload");
const productsController = require("../controllers/product");

router.get("/", productsController.getProducts);

router.get("/user", isAuth, productsController.getUserProducts);

router.get("/categories", productsController.getCategories);

router.get("/search", productsController.getSearchProducts);

router.get(
  "/:prodId",
  param("prodId").isMongoId(),
  productsController.getProduct
);

router.post(
  "/",
  isAuth,
  fileUpload,
  [
    body("title").trim().isString().notEmpty(),
    body("category").trim().isString().notEmpty(),
    body("brand").trim().isString().notEmpty(),
    body("price").custom((value) => {
      if (+value < 10) {
        throw new Error("Price should be bigger than or equal 10.");
      }
      return true;
    }),
    body("countInStock").custom((value) => {
      if (+value === 0) {
        throw new Error("Should'nt be a zero.");
      }
      return true;
    }),
    body("description").trim().isString().notEmpty().isLength({ min: 6 }),
  ],
  productsController.createProduct
);

router.patch(
  "/:prodId",
  isAuth,
  [
    body("price").custom((value) => {
      if (+value < 10) {
        throw new Error("Price should be bigger than or equal 10.");
      }
      return true;
    }),
    body("countInStock").custom((value) => {
      if (+value === 0) {
        throw new Error("Should'nt be a zero.");
      }
      return true;
    }),
    param("prodId").isMongoId(),
  ],
  productsController.updateProduct
);

router.patch(
  "/product/:prodId",
  isAuth,
  [
    body("rating").isNumeric(),
    body("comment").isString().notEmpty(),
    param("prodId").isMongoId(),
  ],
  productsController.addReview
);

router.delete(
  "/:prodId",
  isAuth,
  param("prodId").isMongoId(),
  productsController.deleteProduct
);

module.exports = router;
