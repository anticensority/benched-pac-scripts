'use strict';

const generateAreSubsCensored = require('./libs/generate-are-subs-censored');

function generateDataExpr(hosts, ips) {

  const [hostsStr, ipsStr] = [hosts, ips,].map((arr) => arr.reduce((acc, el) => {

    acc[el] = true;
    return acc;

  }, {})).map(JSON.stringify.bind(JSON));
  return `
    var hosts = Object.assign(Object.create(null), ${hostsStr});
    var ips = Object.assign(Object.create(null), ${ipsStr});
  `;

};

function generateIsCensoredByIpExpr(ips, indent) {

  return `(ip in ips)`;

};

const areSubsCensoredStr = generateAreSubsCensored((sub) => `${sub} in hosts`)

function generateIsCensoredByHostExpr(hosts, indent) {

  return 'areSubsCensored(host)';

};

module.exports = {
  requiredFunctions: [areSubsCensoredStr],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateIsCensoredByHostExpr,
    isCensoredByIpExpr: generateIsCensoredByIpExpr,
  }
};
