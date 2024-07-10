const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const nocache = require("nocache");
const methodOverride = require("method-override");
const logger = require("./src/config/logger.js");

// config .env
dotenv.config();

const connetDB = require("./src/config/db.js");
const passport = require("./src/config/passport-config");

const authRouter = require("./src/routes/auth");
const adminRouter = require("./src/routes/admin");
const shopRouter = require("./src/routes/shop");
const usersRouter = require("./src/routes/users");
const checkoutRouter = require("./src/routes/checkout");

// database config
connetDB();

const app = express();

// view engine setup
app.use(expressLayouts);
app.set("layout", "./layouts/userLayout.ejs");
app.set("views", path.join(__dirname, "View"));
app.set("view engine", "ejs");

// Middlewares
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: process.env.USER_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);

// app.use(
//   session({
//     name: "user-session",
//     secret: process.env.USER_SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 2, // 2 hours
//     },
//   })
// );

// app.use(
//   session({
//     name: "admin-session",
//     secret: "",
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 2, // 2 hours
//     },
//   })
// );

// passport session
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use(nocache());

// Custom middleware

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.use((req, res, next) => {
//   logger.info(`User ${req.user} requested user details ${req}`);
//   next();
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error", {
    layout: false,
  });
});

app.use("/", authRouter);
app.use("/user/", usersRouter);
app.use("/", shopRouter);
app.use("/admin", adminRouter);
app.use("/checkout", checkoutRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on ${process.env.DEV_MODE} on port ${PORT}`);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
