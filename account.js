//jshint esversion: 6

var express = require('express');
var router = express.Router();
const https = require("https");

let accountMessage = "";
let customers = new Map();
let transactions = new Map();
let customerUserNames = new Map();
let totalAmounts = new Map();

function getCustomerName(employeeId){

  let returnValue = null;
  if (customers.size !== 0) {
    returnValue = customers.get(employeeId);
  }
  return returnValue;
}

function getTotalAmount(userName){
  let returnValue = 0;
  if (totalAmounts.size !== 0) {
    returnValue = totalAmounts.get(userName);
  }
  return returnValue;
}

function getCustomerUserName(employeeId) {
	 let returnValue = null;
	  if (customerUserNames.size !== 0) {
	    returnValue = customerUserNames.get(employeeId);
	  }
	  return returnValue;
}

function getCurrentTransactions(employeeId){
  let returnValue = null;
  if (transactions.size !== 0) {
    returnValue = transactions.get(employeeId);
  }
  return returnValue;
}

/**
 * Renders the account page
 * @param req
 * @param res
 * @returns
 */
function renderAccountPage(req, res) {
	  //customerLastName
	  let id = req.params.employeeId;
	  res.render("accounts", {
	    etid: id,
	    customerLoginId: id,
	    customerLogoutId: id,
	    employeeId: id,
	    totalAmount: getTotalAmount(getCustomerUserName(id)),
	    customerUserName: getCustomerUserName(id),
	    transactions: getCurrentTransactions(id),
	    customerName: getCustomerName(id),
	    accountMessage: accountMessage,
	    registerId: id,
	    homeLink: "/home/" + id,
	    productLink: "/products/" + id,
	    accountLink: "/accounts/" + id
	  });
	  accountMessage = "";
	}

/**
 * registers a customer
 * @param req
 * @param res
 * @returns
 */
function registerCustomer(req, res) {

	  ///retrieve value from html form
	  const employeeId = req.params.employeeId;
	  const fName = req.body.customerFirstName;
	  const lName = req.body.customerLastName;
	  const customerId = req.body.customerId;
	  const phoneNumber = req.body.phoneNumber;

	  // convert the input values to javascript object
	  const data = {
	    firstName: fName,
	    lastName: lName,
	    userName: customerId,
	    phoneNumber: phoneNumber
	  };
	  // res.redirect("/products");
	  // convert the javascript object to JSON
	  const jsonData = JSON.stringify(data);

	  const url = "https://ims-heroku-backend.herokuapp.com/customers/" + employeeId;

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
	        accountMessage = JSON.parse(data).message;
	      });
	    } else {
	      accountMessage = "SUCCESS";
	    }
	    res.redirect("/accounts/" + employeeId);
	  });
	  // getProducts(employeeId);
	  request.write(jsonData);
	  request.end();
	}

/**
 * logs in customer
 * @param req
 * @param res
 * @returns
 */
function customerLogin(req, res) {

	  ///retrieve value from html form
	  const employeeId = req.params.employeeId;
	  const cName = req.body.userName;

	// convert the input values to javascript object
	    const data = {
	      userName: cName
	    };
	    // res.redirect("/products");
	    // convert the javascript object to JSON
	    const jsonData = JSON.stringify(data);

	    const url = "https://ims-heroku-backend.herokuapp.com/customers/get/" + employeeId;

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
	          accountMessage = JSON.parse(data).message;
	        });
	      } else {
	        response.on("data", function(data) {
	        	
	        	// set customer user name
	          let customerUserName = JSON.parse(data).userName;
	          customerUserNames.set(employeeId, customerUserName);
	          
	          // set customer name
	          let currentCustomerName = JSON.parse(data).firstName + " " +
	          JSON.parse(data).lastName;
	          customers.set(employeeId, currentCustomerName);
	          
	          // set Transactions
	          let currentTransactions = JSON.parse(data).transactions;
	          let totalAmount = 0;
	          for (var i = 0; i < currentTransactions.length; i++) {
	            totalAmount = totalAmount + currentTransactions[i].amountUnpaid;
	          }
	          totalAmounts.set(customerUserName, totalAmount);
	          transactions.set(employeeId, currentTransactions);
	        });
	      }
	      res.redirect("/accounts/" + employeeId);
	    });
	    // getProducts(employeeId);
	    request.write(jsonData);
	    request.end();
	}

/**
 * logs out a customer
 * @param req
 * @param res
 * @returns
 */
function customerLogout(req, res) {

	  ///retrieve value from html form
	  const employeeId = req.params.employeeId;
	  const userName = req.body.userName;

	  if (userName === "") {
	    accountMessage = "The user name cannot be empty";
	    res.redirect("/accounts/" + employeeId);
	  } else {

	      const url = "https://ims-heroku-backend.herokuapp.com/customers/logout/" + userName;
	      var options = {
	        method: 'PUT',
	        headers: {
	          'Content-Type': 'application/json'
	        }
	      };

	      const request = https.request(url, options, function(response) {
	        if (response.statusCode !== 200) {
	          response.on("data", function(data) {
	            accountMessage = JSON.parse(data).message;
	          });
	        } else {
	          customers.delete(employeeId);
	          transactions.delete(employeeId);
	          totalAmounts.delete(userName);
	          customerUserNames.delete(employeeId);
	          accountMessage = "SUCCESS";
	        }
	        res.redirect("/accounts/" + employeeId);
	      });
	      request.end();
	  } //end of else statement

	}

/**
 * Adds new transaction for a customer
 * @param req
 * @param res
 * @returns
 */
function createTransaction(req, res) {

	  const employeeId = req.params.employeeId;
	  const cUserName = req.params.customerUserName;
	  // convert the input values to javascript object
	  const data = {
	    customerUserName: cUserName
	  };

	  const jsonData = JSON.stringify(data);
	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/";
	  const url = baseUrl + employeeId;

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
	        accountMessage = JSON.parse(data).message;
	      });
	    } else {
	      response.on("data", function(data) {
	    	  let currentTransactions = getCurrentTransactions(employeeId);
	          let newTransaction = JSON.parse(data);
	          currentTransactions.push(newTransaction);
	          });
	      
	    }
	    res.redirect("/accounts/" + employeeId);
	  });
	  // getProducts(employeeId);
	  request.write(jsonData);
	  request.end();

	}

/**
 * Deletes a transaction
 * @param req
 * @param res
 * @returns
 */
function deleteTransaction(req, res) {
	let employeeId = req.params.employeeId;
	let transactionId = req.params.transactionId;
	  
	  const baseUrl = "https://ims-heroku-backend.herokuapp.com/transactions/";
	  const url = baseUrl + transactionId + "/" + employeeId;

	  var options = {
	    method: 'DELETE',
	    headers: {
	      'Content-Type': 'application/json'
	    }
	  };

	  const request = https.request(url, options, function(response) {
	    if (response.statusCode !== 200) {
	    	response.on("data", function(data) {
		        accountMessage = JSON.parse(data).message;
		    });
	    } 
	    else {
	    	let currentTransactions = getCurrentTransactions(employeeId);
	    	  let deletedTransaction = null;
	    	  let index = 0;
	    	  for (var i = 0; i < currentTransactions.length; i++) {
	    		  if (currentTransactions[i].transactionId === transactionId) {
	    			  deletedTransaction = currentTransactions[i];
	    			  index = i;
	    			  break;
	    		  }
	    	  }
	    	  if (deletedTransaction !== null) {
	    		  currentTransactions.splice(index, 1);
	    	  }
	    	  transactions.set(employeeId, currentTransactions);
	    }
	    // renders page
	    res.redirect("/accounts/" + employeeId);
	  });
	  request.end();
}

/**
 * Internally called get transactions.
 * @param req
 * @param res
 * @returns
 */
function getTransactions(req, res) {
	
	  const employeeId = req.params.employeeId;

	  // convert the input values to javascript object
	    const data = {
	      userName: getCustomerUserName(employeeId)
	    };
	    
	    // convert the javascript object to JSON
	    const jsonData = JSON.stringify(data);

	    const url = "https://ims-heroku-backend.herokuapp.com/customers/get/" + employeeId;

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
	          accountMessage = JSON.parse(data).message;
	        });
	      } else {
	        response.on("data", function(data) {
	          // set Transactions
	          let currentTransactions = JSON.parse(data).transactions;
	          let totalAmount = 0;
	          for (var i = 0; i < currentTransactions.length; i++) {
	            totalAmount = totalAmount + currentTransactions[i].amountUnpaid;
	          }
	          let customerUserName = getCustomerUserName(employeeId);
	          totalAmounts.set(customerUserName, totalAmount);
	          transactions.set(employeeId, currentTransactions);
	        });
	      }
	      res.redirect("/accounts/" + employeeId);
	    });
	    // getProducts(employeeId);
	    request.write(jsonData);
	    request.end();
}

//Renders the account page
router.get("/accounts/:employeeId", renderAccountPage);
//registers a customer
router.post("/register/customer/:employeeId", registerCustomer);
//logs in customer
router.post("/login/customer/:employeeId", customerLogin);
//logs out a customer
router.post("/logout/customer/:employeeId", customerLogout);
//Adds new transaction for a customer
router.post("/add/transaction/:employeeId/:customerUserName", createTransaction);
//Deletes a transaction
router.get("/delete/transaction/:employeeId/:transactionId", deleteTransaction);
// gets transactions
router.get("/get/transactions/:employeeId", getTransactions);

module.exports = router;
