//jshint esversion: 6

const express = require('express');
const router = express.Router();
const https = require("https");

let errorMessage = "";
let employeeName = "";
let employeeId = "";

//login route
router.get("/", function(req, res) {
  res.render("login", {
    errorMessage: errorMessage
  });
  errorMessage = "";
});

// login submit post request
router.post("/", function(req, res) {

  ///retrieve value from html form
  const uName = req.body.userName;
  const pw = req.body.password;

  // convert the input values to javascript object
  const data = {
    identifier: uName,
    password: pw
  };

  // convert the javascript object to JSON
  const jsonData = JSON.stringify(data);

  const url = "https://ims-backend-mongodb.herokuapp.com/employees";

  var options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': jsonData.length
    }
  };

  const request = https.request(url, options, function(response) {
    if (response.statusCode !== 200) {
      response.on("data", function(data) {
        errorMessage = JSON.parse(data).message;
        console.log(errorMessage);
      });
    } else {
      response.on("data", function(data) {
        employeeId = JSON.parse(data).employeeId;
        employeeName = JSON.parse(data).firstName;
      });
    }
    res.redirect("/home");
  });

  request.write(jsonData);
  request.end();
});

// To Home Page
router.get("/home", function(req, res) {
  if (employeeId !== "") {
    res.redirect("/home/" + employeeId);
  } else {
    res.redirect("/");
  }
  employeeId = "";
});

router.get("/home/:employeeId", function(req, res) {
  let id = req.params.employeeId;
  res.render("home", {
    employeeName: employeeName,
    homeLink: "/home/" + id,
    productLink: "/products/" + id,
    accountLink: "/accounts/" + id
  });
});

module.exports = router;
