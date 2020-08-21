//jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const ejs = require("ejs");
const productRoutes = require(__dirname + "/product.js");
const loginRoutes = require(__dirname + "/login.js");
const signupRoutes = require(__dirname + "/signup.js");
const homeRoutes = require(__dirname + "/home.js");
const accountRoutes = require(__dirname + "/account.js");
const transactionRoutes = require(__dirname + "/transaction.js");

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/", productRoutes);
app.use("/", loginRoutes);
app.use("/", signupRoutes);
app.use("/", homeRoutes);
app.use("/", accountRoutes);
app.use("/", transactionRoutes);

app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running in port 3000");
});
