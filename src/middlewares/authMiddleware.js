const User = require("../model/userSchema");
const OTP = require("../model/otpSchema");

const passport = require("../config/passport-config");

module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated() && !req.user.isAdmin) {
      return next();
    } else {
      req.flash("error", "Please Login First");
      return res.redirect("/login");
    }
  },

  isLoggedOut: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    } else {
      return next();
    }
  },

  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    } else {
      req.flash("error", "Please Login as Admin First");
      return res.redirect("/admin/login");
    }
  },

  isAdminLoggedOut: (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return res.redirect("/admin");
    } else {
      return next();
    }
  },

  // Check Blocked status for users

  checkBlockedUser: async (req, res, next) => {
    if (req.isAuthenticated()) {
      // console.log('middleware');
      const user = await User.findOne({ _id: req.user.id });
      // console.log(user);
      if (user.isBlocked) {
        req.logout((err) => {
          if (err) {
            console.log(err);
          } else {
            req.flash("error", `User is blocked by the admin!!!!`);
            res.clearCookie("connect.sid");
            return res.redirect("/login");
          }
        });
      }
    }
    next();
  },
};
