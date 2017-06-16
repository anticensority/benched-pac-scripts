'use strict';

const ifFoundByBinary = require('./libs/if-found-by-binary');

function generateUncensorByHostExpr(hosts, indent) {

  return `ifFoundByBinary( eval(${JSON.stringify( JSON.stringify(hosts.sort()) )}), host)`;

};

function generateUncensorByIpExpr(ips, indent) {

  return `ifFoundByBinary(eval(${JSON.stringify( JSON.stringify( ips.sort() ) )}), ip)`;

}

module.exports = {
  mutateHostExpr: `
    if (/\\.(ru|co|cu|com|info|net|org|gov|edu|int|mil|biz|pp|ne|msk|spb|nnov|od|in|ho|cc|dn|i|tut|v|dp|sl|ddns|livejournal|herokuapp|azurewebsites)\\.[^.]+$/.test(host)) {
      host = host.replace(/(.+)\\.([^.]+\\.[^.]+\\.[^.]+$)/, '$2');
    } else {
      host = host.replace(/(.+)\\.([^.]+\\.[^.]+$)/, '$2');
    }
  `,
  requiredFunctions: [ifFoundByBinary],
  generate: {
    ifUncensorByHostExpr: generateUncensorByHostExpr,
    ifUncensorByIpExpr: generateUncensorByIpExpr,
  }
};
