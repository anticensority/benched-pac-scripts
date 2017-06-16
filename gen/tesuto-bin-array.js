'use strict';

function mutateHost() {

  //Remove last dot
  if (host[host.length - 1] === '.') {
    host = host.substring(0, host.length - 1);
  }

  //Convert to second-level domain
  var x = host.lastIndexOf('.');
  if (x !== -1) {
    x = host.lastIndexOf('.', x - 1);
    if (x !== -1) {
      host = host.substr(x + 1);
    }
  }

}

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

function generateUncensorByHostExpr(hosts, indent) {

  return `checkBlocked(${JSON.stringify(hosts.sort())}, host)`;

};

function generateUncensorByIpExpr(ips, indent) {

  return `checkBlocked(${JSON.stringify(ips)}, ip)`;

}

module.exports = {
  generate: {
    mutateHostExpr: `(${mutateHost.toString()})()`,
    requiredFunctions: [checkBlocked],
    generateUncensorByHostExpr,
    generateUncensorByIpExpr,
  }
};
