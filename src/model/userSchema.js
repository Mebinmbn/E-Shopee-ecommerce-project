const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profileImg: {
      type: String,
    },
    wishlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WishList",
    },
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    // joinedDate: {
    //   typ: Date,
    //   default: Date.now,
    //   immutable: true,
    // },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
