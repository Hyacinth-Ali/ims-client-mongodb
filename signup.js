//jshint esversion: 6
const express = require('express');
const router = express.Router();
const https = require("https");

let signupMessage = "";

//Singup
router.get("/signup", function(req, res) {
  res.render("signup", {
	  signupMessage: signupMessage
  });
  signupMessage = "";
});

router.post("/signup", function(req, res) {
  //get input jsonData
  var fName = req.body.firstName;
  var lName = req.body.lastName;
  var uName = req.body.userName;
  var email = req.body.email;
  var pw = req.body.password;
  var cpw = req.body.confirmPassword;

  if (pw !== cpw) {
	  signupMessage = "The two passwords are not equal";
	  res.redirect("/signup");
  }

  //convert inputs to javascript object
  var data = {
    firstName: fName,
    lastName: lName,
    userName: uName,
    email: email,
    password: pw
  };

  var jsonData = JSON.stringify(data);

  const url = "https://ims-backend-mongodb.herokuapp.com/employees";

  var options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': jsonData.length
    }
  };

  let result = "";
  const request = https.request(url, options, function(response) {
    if (response.statusCode !== 200) {
    	response.on("data", function(data){
        result += data;
      });
      response.on("end", function(err) {
        try {
          signupMessage = JSON.parse(result).message;
        } catch (e) {
          console.error(e);
        } 
    		res.redirect("/signup");
    	});
    } else {
      res.render("success");
    }
  });
  request.write(jsonData);
  request.end();
});


module.exports = router;
