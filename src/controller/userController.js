const User = require("../model/userSchema");
const Address = require("../model/addressSchema");
const WishList = require("../model/wishlistSchema");
const Product = require("../model/productSchema");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const logger = require("../config/logger");

module.exports = {
  /**
   * User Profile Mangement
   */
  getProfile: async (req, res) => {
    const locals = {
      title: "E-Shopee - Profile",
    };
    logger.info(`User ${req.user.email} requested user profile`);
    res.render("user/profile", {
      locals,
      user: req.user,
    });
  },
  editProfile: async (req, res) => {
    try {
      console.log(req.body);
      const user = await User.findById(req.user.id);
      logger.info(`User ${req.user.email} requested for profile edit`);
      const { firstName, lastName, phone } = req.body;

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phone = phone || user.phone;

      await user.save();

      // Send a success response back to the client
      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({
        message: "An error occurred while updating the profile",
        error,
      });
    }
  },

  // Password Reset From Profile
  resetPass: async (req, res) => {
    try {
      console.log("Password dtails", req.body);
      const { oldPassword, newPassword, confirmNewPassword } = await req.body;

      let user = await User.findById(req.user.id);
      if (user) {
        let validOldPass = await bcrypt.compare(oldPassword, user.password);

        if (!validOldPass) {
          req.flash("error", "Invalid Old Password");
          return res.redirect("/user/profile");
        }

        if (newPassword !== confirmNewPassword) {
          req.flash("error", "Passwords do not match");
          return res.redirect("/user/profile");
        }

        const hashPwd = await bcrypt.hash(newPassword, 10);
        user.password = hashPwd;
        console.log("User details", user);
        await user.save();
        console.log(user);
        req.flash("success", "Password Updated");
        return res.redirect("/user/profile");
      }
    } catch (error) {
      // return res.status(500).json({ 'error': 'Internal server error' });
      req.flash("error", "Internal server error");
      return res.redirect("/user/profile");
    }
  },

  getAddress: async (req, res) => {
    const address = await Address.find({
      customer_id: req.user.id,
      delete: false,
    });

    console.log(address);
    console.log(req.user);
    logger.info(`User ${req.user.email} requested for user address`);
    const locals = {
      title: "Eshopee - Profile",
    };

    res.render("user/address", {
      locals,
      address,
      user: req.user,
    });
  },

  addAddress: async (req, res) => {
    console.log(req.body);
    await Address.create(req.body);
    logger.info(`User ${req.user.email} added new address`);
    req.flash("success", "Address Addedd");
    res.redirect("/user/address");
  },

  getEditAddress: async (req, res) => {
    const addressId = req.params.id;

    try {
      const address = await Address.findOne({ _id: addressId });
      if (address) {
        res.status(200).json({ status: true, address });
      } else {
        // Send a  404 status code with a JSON object indicating the address was not found
        res.status(404).json({ status: false, message: "Address not found" });
      }
    } catch (error) {
      // Handle any errors that occurred during the database operation
      console.error(error);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  },

  editAddress: async (req, res) => {
    try {
      const addressId = req.params.id;
      const updatedAddress = req.body;

      // Assuming you have a model for addresses, e.g., Address
      const address = await Address.findByIdAndUpdate(
        addressId,
        updatedAddress,
        {
          new: true, // returns the new document if true
        }
      );

      if (!address) {
        return res
          .status(404)
          .send({ message: "Address not found with id " + addressId });
      }

      req.flash("success", "Address Edited");
      res.redirect("/user/address");
    } catch (error) {
      console.error(error);
      req.flash("error", "Error editing address. Please try again.");
      res.redirect("/user/address");
    }
  },

  deleteAddress: async (req, res) => {
    let id = req.params.id;
    try {
      const result = await Address.findByIdAndUpdate(
        id,
        { delete: true },
        { new: true }
      );
      if (result) {
        console.log(result);
        res.status(200).json({ message: "Address deleted successfully" });
      } else {
        res.status(404).json({ message: "Address not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  /***
   * User Wishlist Mangement
   */

  getWishlist: async (req, res) => {
    const locals = {
      title: "E-Shopee - Wishlist",
    };
    let user = await User.findById(req.user.id);
    let wishlist = await WishList.findById(user.wishlist).populate({
      path: "products",
      populate: { path: "brand" },
    });
    // console.log(wishlist);
    let products;

    if (!wishlist) {
      products = [];
    } else {
      products = wishlist.products;
    }

    res.render("user/wishlist", {
      user,
      locals,
      wishlist,
      products,
    });
  },

  addToWishlist: async (req, res) => {
    console.log(req.body);
    // if (!req.isAuthenticated()) {
    //   req.flash("error", "Please log in to add product to wishlist");
    //   return res.status(401).json({
    //     success: false,
    //     message: "Please log in to add product to wishlist",
    //   });
    // }

    const { productId } = req.body;
    let product,
      user,
      userWishListID,
      userWishListData,
      productsInWishList,
      productAlreadyInWishList;

    try {
      product = await Product.findById(productId);
      user = await User.findById(req.user.id);

      if (!product) {
        console.log("Product not found");
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (!user) {
        console.log("User not found");
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      userWishListID = user.wishlist;

      if (!userWishListID) {
        const newWishList = new WishList({ userId: user._id });
        await newWishList.save();
        userWishListID = newWishList._id;
        await User.findByIdAndUpdate(user._id, {
          $set: { wishlist: userWishListID },
        });
      }

      userWishListData = await WishList.findById(userWishListID);
      productsInWishList = userWishListData.products;

      productAlreadyInWishList = productsInWishList.some((existingProduct) =>
        existingProduct.equals(product._id)
      );

      if (productAlreadyInWishList) {
        console.log("Product already exists in wishlist");
        return res.status(400).json({
          success: false,
          message: "Product already exists in wishlist",
        });
      }

      await WishList.findByIdAndUpdate(userWishListID, {
        $push: { products: product._id },
      });

      console.log("Product added to wishlist");
      return res
        .status(201)
        .json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred, server facing issues !",
      });
    }
  },

  removeFromWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const user = await User.findById(req.user.id);

      const updatedWishList = await WishList.findByIdAndUpdate(user.wishlist, {
        $pull: { products: productId },
      });

      if (updatedWishList) {
        return res.status(201).json({
          success: true,
          message: "Removed item from wishlist",
        });
      } else {
        return res.status(500).json({
          success: true,
          message: "failed to remove product from wishlist try again",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: true,
        message: "failed to remove product from wishlist try again",
      });
    }
  },
};
