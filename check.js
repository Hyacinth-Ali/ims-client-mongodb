/**
 * http://usejsdoc.org/
 */

function getCurrentTransaction(customerUserName){
  let returnValue = null;
  if (transactions.size !== 0) {
    returnValue = transactions.get(customerUserName);
  }
  return returnValue;
}