const express = require("express");
const router = express.Router();

const User = require("../model/userSchema");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const userController = require("../controller/userController");
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const checkoutController = require("../controller/checkoutController");
const reviewController = require("../controller/reviewController");

router.use(isLoggedIn, async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return res.redirect("/admin");
  }
  // res.locals.success = req.flash("success");
  // res.locals.error = req.flash("error");
  next();
});

/**
 * User Profile
 */

router
  .route("/profile")
  .get(userController.getProfile)
  .post(userController.editProfile);

router.route("/reset-password").post(userController.resetPass);

// address management

router.get("/address", userController.getAddress);
router.post("/address/add-address", userController.addAddress);
router.post("/address/add-checkoutaddress", userController.addCheckoutAddress);
router
  .route("/address/edit-address/:id")
  .get(userController.getEditAddress)
  .post(userController.editAddress);
router
  .route("/address/delete-address/:id")
  .delete(userController.deleteAddress);

// order management

router.post("/place-order", checkoutController.placeOrder);
router.post("/verify-payment", checkoutController.verifyPayment);

router.route("/orders").get(orderController.getUserOrders);
router.get("/order/:orderId", orderController.getSingleOrder);
router.post("/cancel-order/:id/:itemId/:variant", orderController.cancelOrder);
router.post("/return-order/", orderController.returnOrder);
router.post("/cancel-all-order/:id/", orderController.cancelAllOrders);

// Cart maanagement

router.get("/cart", cartController.getCart);
router.post("/add-to-cart/", cartController.addToCart);

router.get(
  "/cart/remove-from-cart/:id/:variant",
  cartController.removeCartItem
);
router.get(
  "/cart/increase-quantity/:id/:variant",
  cartController.incrementCartItem
);
router.get(
  "/cart/decrease-quantity/:id/:variant",
  cartController.decrementCartItem
);

/**
 * User Wishlist
 */

router.get("/wishlist", userController.getWishlist);
router.post("/add-to-wishlist", userController.addToWishlist);
router.delete("/remove-from-wishlist", userController.removeFromWishlist);

//  invoice
router.get("/invoice/:id/:itemId", orderController.getInvoice);
// router.get("/invoice/download/:id/:itemId", orderController.downloadInvoice);

/**
 * User Wallet
 */

router.get("/wallet", userController.getWallet);
router.post("/add-to-wallet", userController.addToWallet);
router.post("/verify-wallet-payment", userController.verifyPayment);

/**
 * User Review
 */
router.post("/add-review", reviewController.postReview);

module.exports = router;
