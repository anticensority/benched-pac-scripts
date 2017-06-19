'use strict';

const ifFoundByBinary = require('./libs/if-found-by-binary');
const generateAreSubsCensored = require('./libs/generate-are-subs-censored');

function generateDataExpr(hosts, ips) {

  return `
    var hosts = ${JSON.stringify(hosts)};
    var ips = ${JSON.stringify(ips)};
  `;

};

function generateIsCensoredByIpExpr(ips, indent) {

  return `ifFoundByBinary(ips, ip)`;

}

const areSubsCensoredStr = generateAreSubsCensored((sub) => `ifFoundByBinary(hosts, ${sub})`);

function generateIsCensoredByHostExpr(hosts, indent) {

  return `areSubsCensored(host)`;

};

module.exports = {
  requiredFunctions: [ifFoundByBinary, areSubsCensoredStr],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateIsCensoredByHostExpr,
    isCensoredByIpExpr: generateIsCensoredByIpExpr,
  }
};
