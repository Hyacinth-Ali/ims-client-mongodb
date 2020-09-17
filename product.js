//jshint esversion: 6

var express = require('express');
var router = express.Router();
const https = require("https");

let productMessage = "";
var products = [];

function getProducts(req, res) {

	  let id = req.params.employeeId;
	  // fetch products
	  const url = "https://ims-backend-mongodb.herokuapp.com/products/" + id;

	  var options = {
	    method: 'GET',
	    headers: {
	      'Content-Type': 'application/json'
	      // 'Content-Length': jsonData.length
	    }
	  };

		// start of new code
		let result = "";
		const request = https.request(url, options, function(response) {
	    response.on("data", function(data) {
				result += data;
			});
			response.on("end", function(err) {
				try {
					products = JSON.parse(result);
				} catch (e) {
					console.error(e);
				}
	    });
	    res.redirect("/get/products/" + id);
	  });
	  request.end();
	}

function renderProducts(req, res) {

	  let id = req.params.employeeId;
	  res.render("products", {
	      updateId: id,
	      products: products,
	      getId: id,
	      employeeId: id,
	      homeLink: "/home/" + id,
	      productLink: "/products/" + id,
	      accountLink: "/accounts/" + id,

	      productMessage: productMessage
	    });
	    productMessage = "";
}

function addProduct(req, res) {
	  ///retrieve value from html form
	  const employeeId = req.params.employeeId;
	  const pName = req.body.productName;
	  const pQuantity = req.body.productQuantity;
	  const pPrice = req.body.productPrice;

	  // convert the input values to javascript object
	  const data = {
	    name: pName,
	    quantity: pQuantity,
	    itemPrice: pPrice
	  };
	  // res.redirect("/products");
	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);

	  const url = "https://ims-backend-mongodb.herokuapp.com/products/" + employeeId;

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
	      response.on("data", function(data) {
					result += data;
				});
				response.on("end", function(err) {
					try {
						productMessage = JSON.parse(result).message;
					} catch (e) {
						console.error(e);
					}
	      });
	    }
	    res.redirect("/products/" + employeeId);
	  });
	  // getProducts(employeeId);
	  request.write(jsonData);
	  request.end();

	}

function updateProduct(req, res) {

	  const id = req.params.employeeId;
	  ///retrieve values from html form
	  const name = req.body.productName;
	  const q = req.body.productQuantity;
	  const p = req.body.productPrice;
	  const newQuantity = req.body.newQuantity;
	  const quantity = Number(q) + Number(newQuantity);

	  // convert the input values to javascript object
	  const data = {
	    name: name,
	    quantity: quantity,
	    itemPrice: p
	  };

	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);
	  let baseUrl = "https://ims-backend-mongodb.herokuapp.com/products";
	  const url = baseUrl + "/" + id + "/" + name;
	 var options = {
	    method: 'PUT',
	    headers: {
	      'Content-Type': 'application/json',
	      'Content-Length': jsonData.length
	    }
	  };

		let result = "";
	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      response.on("data", function(data) {
					result += data;
				});
				response.on("end", function(err) {
					try {
						productMessage = JSON.parse(result).message;
					} catch (e) {
						console.error(e);
					}
	      });
	    } else {
	    	productMessage = "SUCCESS";
	    }
	    res.redirect("/products/" + id);
	  });

	  request.write(jsonData);
	  request.end();


	}

function deleteProduct(req, res) {

	  const id = req.params.employeeId;
	  ///retrieve values from html form
	  const n = req.body.productName;

	  // convert the input values to javascript object
	  const data = {
	    name: n
	  };

	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);
	  let baseUrl = "https://ims-backend-mongodb.herokuapp.com/products/";
	  const url = baseUrl + id;
	   var options = {
	    method: 'DELETE',
	    headers: {
	      'Content-Type': 'application/json',
	      'Content-Length': jsonData.length
	    }
	  };

		let result = "";
	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      response.on("data", function(data) {
					result += data;
				});
				response.on("end", function(err) {
					try {
						productMessage = JSON.parse(result).message;
					} catch (e) {
						console.error(e);
					}
	      });
	    } else {
	    	productMessage = "SUCCESS";
	    }
	    res.redirect("/products/" + id);
	  });
	  request.write(jsonData);
	  request.end();
	}

router.get("/products/:employeeId", getProducts);
router.get("/get/products/:employeeId", renderProducts);
router.post("/add/product/:employeeId", addProduct);
router.post("/update/product/:employeeId", updateProduct);
router.post("/delete/product/:employeeId", deleteProduct);


module.exports = router;
