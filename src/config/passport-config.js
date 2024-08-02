require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcrypt");

const User = require("../model/userSchema");

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

async function authenticateUser(email, password, done) {
  const user = await User.findOne({ email, isAdmin: false });
  if (!user) {
    return done(null, false, { message: "No user found with that email" });
  }

  // const isValid = await user.matchPassword(password);
  const isValid = await bcrypt.compare(password, user.password);

  console.log(isValid);

  if (!isValid) {
    return done(null, false);
  } else {
    return done(null, user);
  }
}

async function authenticateAdmin(email, password, done) {
  const user = await User.findOne({ email, isAdmin: true });
  if (!user) {
    return done(null, false, { message: "Not Authorized" });
  }

  const isValid = await bcrypt.compare(password, user.password);

  console.log(isValid);

  if (!isValid) {
    return done(null, false);
  } else {
    return done(null, user);
  }
}

// passport.use(new LocalStrategy(customFields, verifyCallback));
passport.use("user-local", new LocalStrategy(customFields, authenticateUser));
passport.use("admin-local", new LocalStrategy(customFields, authenticateAdmin));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
// passport.serializeUser((user, done) => {
//   if (!user.isAdmin) {
//     console.log("serialized");
//     done(null, { id: user.id, type: "user" });
//   }
// });

// passport.deserializeUser(async (obj, done) => {
//   if (obj.type === "user") {
//     console.log("deserialized");
//     const user = await User.findById(obj.id);
//     done(null, user);
//   }
// });

// passport.serializeUser((user, done) => {
//   if (user.isAdmin) {
//     console.log("serialized");
//     done(null, user.id);
//   }
// });

// passport.deserializeUser(async (user, done) => {
//   try {
//     if (user.isAdmin) {
//       console.log("Deserializing admin:", user);
//       const admin = await User.findById(user.id);
//       done(null, admin);
//     } else {
//       console.log("User is not admin:", user);
//       done(null, false);
//     }
//   } catch (err) {
//     console.log("Error during deserialization:", err);
//     done(err, null);
//   }
// });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: "www.mebin.live/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if the user already exists in the database
      let user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // If the user exists, update their details (if necessary)
        user.username = profile.displayName;
        user.firstName = profile.displayName;
        user.lastName = profile.displayName;
        user.email = profile.emails[0].value;
        await user.save();
      } else {
        // If the user does not exist, create a new user
        user = await User.create({
          username: profile.displayName,
          firstName: profile.displayName,
          lastName: profile.displayName,
          email: profile.emails[0].value,
          password: "",
        });
      }
      return done(null, user);
    }
  )
);

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: "/facebook",
//       profileFields: ["email", "displayname", "name", "picture"],
//     },
//     (accessTocken, refreshTocken, profile, callback) => {
//       callback(null, profile);
//     }
//   )
// );

module.exports = passport;
