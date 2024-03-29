var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const hbs = require("express-handlebars");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");

const moment = require("moment");
// var fileUpload=require('express-fileupload')
var db = require("./config/connection");
const session = require("express-session");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

//setup template engine
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
    helpers: {
      isEqual: (status, value, options) => {
        if (status == value) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      iterateTimes:
        ("times",
        function (n, block) {
          var accum = "";
          for (var i = 1; i <= n; i++) accum += block.fn(i);
          return accum;
        }),
      indexFrom1: (value, options) => {
        return parseInt(value) + 1;
      },
      
    },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(fileUpload())
db.connect((err) => {
  if (err) {
    console.log("Connection error" + err);
  } else {
    console.log("Database connected to port 27017");
  }
});

//SESSION CREATION
const maxAge = 24 * 60 * 60 * 1000;
app.use(
  session({
    secret: "Key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: maxAge },
  })
);

app.use("/", userRouter);
app.use("/admin", adminRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  
  res.status(err.status || 500);
  res.render("404");
  console.log(err);
});




module.exports = app;
