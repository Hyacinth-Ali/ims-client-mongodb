//jshint esversion: 6

const express = require('express');
const router = express.Router();
const https = require("https");

let transactions = new Map();
let customerUserName = "";
let transactionMessage = "";
let products = [];
let transactionId = "";

function getCurrentTransaction(customerUserName){
  let returnValue = null;
  if (transactions.size !== 0) {
    returnValue = transactions.get(customerUserName);
  }
  return returnValue;
}

/**
 * Gets details of a given transaction.
 */
function getTransaction(req, res) {

	  let employeeId = req.params.employeeId;
	  transactionId = req.params.transactionId;
	  customerUserName = req.params.userName;
	  let userName = req.params.userName;

	  // convert the input values to javascript object
	  const data = {
	    customerUserName: userName
	  };

	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);

	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/";
	  const url = baseUrl + employeeId + "/" + transactionId;
	 
	  var options = {
	    method: 'GET',
	    headers: {
	      'Content-Type': 'application/json',
	      'Content-Length': jsonData.length
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      transactionMessage = JSON.parse(data).message;
	    } else {
	      response.on("data", function(data) {
	        let transaction = JSON.parse(data);
	        console.log(transaction);
	        customerUserName = userName;
	        transactions.delete(userName);
	        transactions.set(userName, transaction);
	      });
	    }
	    res.redirect("/transaction/products/" + employeeId);
	  });
	  request.write(jsonData);
	  request.end();
	}

/**
 * Gets the products and transactions of a given transaction.
 */
function getTransactionProducts(req, res) {
	  let employeeId = req.params.employeeId;
	  const url = "https://ims-heroku-backend.herokuapp.com/products/" + employeeId;

	  var options = {
	    method: 'GET',
	    headers: {
	      'Content-Type': 'application/json'
	      // 'Content-Length': jsonData.length
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    response.on("data", function(data) {
	      products = JSON.parse(data);
	    });
	    res.redirect("/transaction/" + employeeId + "/" + customerUserName);
	  });
	  request.end();
	}

/**
 * Renders the page for a given transaction.
 */
function renderTransactionPage(req, res) {

	  let id = req.params.employeeId;
	  customerUserName = req.params.userName;
	  let transaction = getCurrentTransaction(customerUserName);
	 let customerName = transaction.firstName + " " + transaction.lastName;
	  res.render("transaction", {
	    transactionId: transaction.transactionId,
	    transactionMessage: transactionMessage,
	    employeeId: id,
	    customerName: customerName,
	    customerUserName: customerUserName,
	    phoneNumber: transaction.phoneNumber,
	    transactionDate: transaction.date,
	    totalAmount: transaction.totalAmount,
	    amountPaid: transaction.amountPaid,
	    pTransactions: transaction.pTransactions,
	    amountLeft: transaction.amountUnpaid,
	    products: products,
	    homeLink: "/home/" + id,
	    productLink: "/products/" + id,
	    accountLink: "/accounts/" + id
	  });
	  customerUserName = "";
	  transactionId = "";
	  transactionMessage = "";
	}

/**
 * Adds a product to a given transaction.
 */
function addTransactionProduct(req, res) {
	  ///retrieve value from html form
	  customerUserName = req.params.customerUserName;
	  transactionId = req.params.transactionId;
	  const employeeId = req.params.employeeId;
	  const pName = req.body.productName;
	  const pQuantity = req.body.productQuantity;

	  // convert the input values to javascript object
	  const data = {
	    productName: pName,
	    quantity: pQuantity
	  };
	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);
	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/";
	  const url = baseUrl + employeeId + "/" + transactionId;

	  var options = {
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json',
	      'Content-Length': jsonData.length
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      response.on("data", function(data) {
	        transactionMessage = JSON.parse(data).message;
	      });
	    } 
//	    else {
//	    	response.on("data", function(data) {
//	    		let currentTransaction = getCurrentTransaction(customerUserName);
//	    		let currentProductTransactions = currentTransaction.pTransactions;
//	    		currentProductTransactions.push(JSON.parse(data));
//		      });
//	    }
	    res.redirect("/get/transaction/" + customerUserName + "/" + 
	    		employeeId + "/" + transactionId);
	  });
	  // getProducts(employeeId);
	  request.write(jsonData);
	  request.end();
	}

function updateProductTransaction(req, res) {
	  //retrieve value from html form
	  customerUserName = req.params.customerUserName;
	  transactionId = req.params.transactionId;
	  const employeeId = req.params.employeeId;
	  const pName = req.body.productName;
	  const pQuantity = req.body.productQuantity;

	  // convert the input values to javascript object
	  const data = {
	    productName: pName,
	    quantity: pQuantity
	  };
	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);
	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/";
	  const url = baseUrl + employeeId + "/" + transactionId;

	  var options = {
	    method: 'PUT',
	    headers: {
	      'Content-Type': 'application/json',
	      'Content-Length': jsonData.length
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      response.on("data", function(data) {
	        transactionMessage = JSON.parse(data).message;
	      });
	    }
	    res.redirect("/get/transaction/" + customerUserName + "/" + 
	    		employeeId + "/" + transactionId);
	  });
	  // getProducts(employeeId);
	  request.write(jsonData);
	  request.end();
}

function removeProductTransaction(req, res) {
	//retrieve value from html form
	  customerUserName = req.params.customerUserName;
	  transactionId = req.params.transactionId;
	  const employeeId = req.params.employeeId;
	  const pName = req.body.productName;

	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/";
	  const url = baseUrl + "/" + pName + "/" + transactionId + "/" + employeeId;

	  var options = {
	    method: 'DELETE',
	    headers: {
	      'Content-Type': 'application/json'
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      response.on("data", function(data) {
	        transactionMessage = JSON.parse(data).message;
	      });
	    }
	    res.redirect("/get/transaction/" + customerUserName + "/" + 
	    		employeeId + "/" + transactionId);
	  });
	  request.end();
}

function payForTransaction(req, res) {
	 //retrieve value from html form
	  customerUserName = req.params.customerUserName;
	  transactionId = req.params.transactionId;
	  const employeeId = req.params.employeeId;
	  const amountPaid = req.body.paidAmount;
	  // convert the input values to javascript object
	  const data = {
	    amountPaid: amountPaid
	  };
	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);
	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/amount/";
	  const url = baseUrl + transactionId + "/" + employeeId;

	  var options = {
	    method: 'PUT',
	    headers: {
	      'Content-Type': 'application/json',
	      'Content-Length': jsonData.length
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      response.on("data", function(data) {
	        transactionMessage = JSON.parse(data).message;
	      });
	    }
	    res.redirect("/get/transaction/" + customerUserName + "/" + 
	    		employeeId + "/" + transactionId);
	  });
	  // getProducts(employeeId);
	  request.write(jsonData);
	  request.end();
}

function finalizeTransaction(req, res) {
	//retrieve value from html form
	  customerUserName = req.params.customerUserName;
	  transactionId = req.params.transactionId;
	  const employeeId = req.params.employeeId;
	  
	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/finalize/";
	  const url = baseUrl + transactionId + "/" + employeeId;

	  var options = {
	    method: 'PUT',
	    headers: {
	      'Content-Type': 'application/json'
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	      response.on("data", function(data) {
	        transactionMessage = JSON.parse(data).message;
	        console.log(transactionMessage);
	      });
	    } else {
	    	transactionMessage = "SUCCESS";
	    }
	    res.redirect("/get/transaction/" + customerUserName + "/" + 
	    		employeeId + "/" + transactionId);
	  });
	  request.end();
}

router.get("/get/transaction/:userName/:employeeId/:transactionId", getTransaction);
router.get("/transaction/products/:employeeId", getTransactionProducts);
router.get("/transaction/:employeeId/:userName", renderTransactionPage);
router.post("/add/product/:transactionId/:employeeId/:customerUserName", addTransactionProduct);
router.post("/update/product/:transactionId/:employeeId/:customerUserName", updateProductTransaction);
router.post("/remove/product/:transactionId/:employeeId/:customerUserName", removeProductTransaction);
router.post("/pay/:transactionId/:employeeId/:customerUserName", payForTransaction);
router.post("/finalize/:transactionId/:employeeId/:customerUserName", finalizeTransaction);

module.exports = router;
