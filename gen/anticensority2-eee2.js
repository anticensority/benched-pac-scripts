'use strict';

const ifFoundByBinary = require('./libs/if-found-by-binary');
const generateAreSubsCensored = require('./libs/generate-are-subs-censored');
const hash37 = require('./libs/hash37');

function hash(host) {
  return host.split('.').slice(-2).map((w) => w.length*37 + hash37(w)).reduce((sum, i) => sum*37 + i, 0) % 1500;
}

function generateDataExpr(hosts, ips) {

  let hashToHosts = [];

  hosts.forEach( function(host) {

    const i = hash(host);
    hashToHosts[i] = hashToHosts[i] || {};
    hashToHosts[i][host] = true;

  });

  let numToIps = [];

  ips.forEach( function(ip) {

    const i = parseInt(ip.split('.')[3]);
    numToIps[i] = numToIps[i] || [];
    numToIps[i].push(ip);

  });

  numToIps = numToIps.map((ips) => ips.sort());

  return `
    var ips = ${JSON.stringify(numToIps)};
    var hosts = ${JSON.stringify(hashToHosts)};
  `;
  //var ips = Object.assign(Object.create(null), ${ipsStr});

};

function generateIsCensoredByIpExpr(ips, indent) {

  return `ifFoundByBinary( ips[parseInt(ip.split('.')[3])], ip )`;

};

//const areSubsCensoredStr = generateAreSubsCensored((sub) => `${sub} in hosts`)

function generateIsCensoredByHostExpr(hosts, indent) {

  return `host in hosts[hash(host)]`;

};

module.exports = {
  requiredFunctions: [hash37, hash, ifFoundByBinary],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateIsCensoredByHostExpr,
    isCensoredByIpExpr: generateIsCensoredByIpExpr,
  }
};
