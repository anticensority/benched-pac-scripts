'use strict';

const ifFoundByBinary = require('./libs/if-found-by-binary');

/*
function checkBlocked(a, match) {
  var l = 0, r = a.length - 1;

  while (l < r) {
    var x = (l + r) >>> 1;

    if (a[x] < match) {
      l = x + 1;
    }else{
      r = x;
    }
  }

  return a[l] === match;
}
*/

function generateUncensorByHostExpr(hosts, indent) {

  return `ifFoundByBinary(${JSON.stringify(hosts.sort())}, host)`;

};

function generateUncensorByIpExpr(ips, indent) {

  return `ifFoundByBinary(${JSON.stringify(ips.sort())}, ip)`;

}

module.exports = {
  requiredFunctions: [ifFoundByBinary],
  generate: {
    ifUncensorByHostExpr: generateUncensorByHostExpr,
    ifUncensorByIpExpr: generateUncensorByIpExpr,
  }
};
