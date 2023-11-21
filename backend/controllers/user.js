const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const HttpError = require("../errors/http-error");
const Product = require("../models/product");
const User = require("../models/user");

const createToken = require("../util/createToken");
const sendMail = require("../util/send-mail");

exports.createUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signnig up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("Email exists, please pick another one.", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Signnig up failed, please try again later.",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name: name,
    email: email,
    password: hashedPassword,
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signnig up failed, please try again later.",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = createToken(createdUser.id);
  } catch (err) {
    const error = new HttpError(
      "Signnig up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    name: createdUser.name,
    email: createdUser.email,
    passwordLength: password.length,
    address: createdUser.address,
    token,
  });
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError("Login failed, please try again later.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Email does not exists, please signup instead.",
      404
    );
    return next(error);
  }

  let isPasswordMatched;
  try {
    isPasswordMatched = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Login failed, please try again later.", 500);
    return next(error);
  }

  if (!isPasswordMatched) {
    const error = new HttpError("Password is not correct.", 422);
    return next(error);
  }

  const { resetToken, resetTokenExpiration } = existingUser;
  if (resetToken && resetTokenExpiration) {
    existingUser.resetToken = undefined;
    existingUser.resetTokenExpiration = undefined;

    try {
      await existingUser.save();
    } catch (err) {
      const error = new HttpError(
        "Could not log you in, please check your credentials and try again.",
        500
      );
      return next(error);
    }
  }

  let token;
  try {
    token = createToken(existingUser.id);
  } catch (err) {
    const error = new HttpError(
      "Signnig up failed, please try again later.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    name: existingUser.name,
    email: existingUser.email,
    passwordLength: password.length,
    address: existingUser.address,
    token,
  });
};

exports.getCart = async (req, res, next) => {
  let existingUser;
  try {
    existingUser = await User.findById(req.userId).populate("cart.productId");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Cannot find user for provided id", 404);
    return next(error);
  }

  res.status(200).json({
    cart: existingUser.cart.map((item) => {
      return {
        _id: item.productId.id,
        title: item.productId.title,
        image: item.productId.image,
        price: item.productId.price,
        description: item.productId.description,
        quantity: item.quantity,
      };
    }),
  });
};

exports.addToCart = async (req, res, next) => {
  const { prodId } = req.params;

  let existingUser;
  try {
    existingUser = await User.findById(req.userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Cannot find user for provided id", 404);
    return next(error);
  }

  let existsingProduct;
  try {
    existsingProduct = await Product.findById(prodId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  if (!existsingProduct) {
    const error = new HttpError("Product don't exist.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await User.addToCart(req.userId, prodId, sess);
    await Product.updateOne(
      { _id: prodId },
      { $inc: { countInStock: -1 } },
      { session: sess }
    );

    await sess.commitTransaction();
    await sess.endSession();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ message: "Cart updated." });
};

exports.deleteFromCart = async (req, res, next) => {
  const { prodId } = req.params;
  const { directDelete } = req.query;

  let existingUser;
  try {
    existingUser = await User.findById(req.userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Cannot find user for provided id", 404);
    return next(error);
  }

  const quantity = existingUser.cart.find(
    (item) => item.productId.toString() === prodId
  ).quantity;

  if (directDelete === "true") {
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();

      await User.updateOne(
        { _id: req.userId },
        { $pull: { cart: { productId: prodId } } },
        { session: sess }
      );
      await Product.updateOne(
        { _id: prodId },
        { $inc: { countInStock: quantity } },
        { session: sess }
      );

      await sess.commitTransaction();
      await sess.endSession();
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, please try again later.",
        500
      );
      return next(error);
    }
  } else {
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();

      await User.deleteFromCart(req.userId, prodId, sess);
      await Product.updateOne(
        { _id: prodId },
        { $inc: { countInStock: 1 } },
        { session: sess }
      );

      await sess.commitTransaction();
      await sess.endSession();
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, please try again later.",
        500
      );
      return next(error);
    }
  }

  res.status(200).json({ message: "Product removed from cart." });
};

exports.saveAddress = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findById(req.userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Cannot find user for provided id", 404);
    return next(error);
  }

  try {
    await User.updateOne(
      { _id: existingUser._id },
      { $set: { address: req.body } }
    );
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  res.status(201).json({ message: "User address is saved." });
};

exports.restPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Could not find user for provided email.", 404);
    return next(error);
  }

  let buffer;
  try {
    buffer = crypto.randomBytes(32);
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }
  const token = buffer.toString("hex");

  existingUser.resetToken = token;
  existingUser.resetTokenExpiration = Date.now() + 3600000;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  try {
    await sendMail(existingUser.email, existingUser.name, token);
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ email: existingUser.email, passwordToken: token });
};

exports.getNewPassword = async (req, res, next) => {
  const { passwordToken } = req.params;

  let existingUser;
  try {
    existingUser = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again.", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not reset your password.",
      403
    );
    return next(error);
  }

  res.status(200).json({ userId: existingUser.id });
};

exports.updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { userId, newPassword, passwordToken } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
  } catch (err) {
    const error = new HttpError(
      "Reset password failed, please try again.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError("Could not find user for provided email.", 404);
    return next(error);
  }

  let passwordIsSame;
  try {
    passwordIsSame = await bcrypt.compare(newPassword, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Reset password failed, please try again later.",
      500
    );
    return next(error);
  }

  if (passwordIsSame) {
    const error = new HttpError(
      "You entered the same password, please pick anothor one.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 12);
  } catch (err) {
    const error = new HttpError(
      "Reset password failed, please try again later.",
      500
    );
    return next(error);
  }

  existingUser.resetToken = undefined;
  existingUser.resetTokenExpiration = undefined;
  existingUser.password = hashedPassword;

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError(
      "Reset password failed, please try again.",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ message: "Password updated.", passwordLength: newPassword.length });
};
