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
  const lenToStrMap = Object.keys(lenToArr).reduce((acc, len) => {

    acc.set(parseInt(len), lenToArr[len].sort().join(''));
    return acc;

  }, new Map());
  return lenToStrMap;

};

function generateDataExpr(hostsArr, ipsArr) {

  const ipsJson = JSON.stringify( Array.from(toLenToStr(ipsArr).entries()) );
  const hostsJson = JSON.stringify( Array.from(toLenToStr(hostsArr).entries()) );

  return `
    const ips = new Map(${ipsJson});
    const hosts = new Map(${hostsJson});
  `;

}

const areSubsCensoredStr = generateAreSubsCensored((sub) => `ifFoundByBinaryInString(hosts.get(${sub}.length) || '', ${sub})`);

function generateUncensorByHostExpr(hosts, indent) {

  return `areSubsCensored(host)`;

};

function generateUncensorByIpExpr(ips, indent) {

  return `ifFoundByBinaryInString(ips.get(ip.length) || '', ip)`;

}

module.exports = {
  requiredFunctions: [ifFoundByBinaryInString, areSubsCensoredStr],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateUncensorByHostExpr,
    isCensoredByIpExpr: generateUncensorByIpExpr,
  }
};
