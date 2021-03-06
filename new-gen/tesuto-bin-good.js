'use strict';

const Fs = require('fs');
const ifFoundByBinaryInString = require('./libs/if-found-by-binary-in-string');
const generateAreSubsCensored = require('./libs/generate-are-subs-censored');

const toLenToStr = (words) => {

  const lenToArr = words.reduce((acc, word, i) => {

    acc[word.length] = acc[word.length] || [];
    acc[word.length].push(word);
    return acc;

  }, {});
  const lenToStr = Object.keys(lenToArr).reduce((acc, len) => {

    acc[len] = lenToArr[len].sort().join('');
    return acc;

  }, {});
  return lenToStr;

};

function generateDataExpr(hostsArr, ipsArr) {

  const ipsJson = JSON.stringify( toLenToStr(ipsArr) );
  const hostsJson = JSON.stringify( toLenToStr(hostsArr) );

  return `
    const ips = ${ipsJson};
    const hosts = ${hostsJson};
  `;

}

const areSubsCensoredStr = generateAreSubsCensored((sub) => `ifFoundByBinaryInString(hosts[${sub}.length] || '', ${sub})`);

function generateUncensorByHostExpr(hosts, indent) {

  return `areSubsCensored(host)`;

};

function generateUncensorByIpExpr(ips, indent) {

  return `ifFoundByBinaryInString(ips[ip.length] || '', ip)`;

}

module.exports = {
  requiredFunctions: [ifFoundByBinaryInString, areSubsCensoredStr],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateUncensorByHostExpr,
    isCensoredByIpExpr: generateUncensorByIpExpr,
  }
};
