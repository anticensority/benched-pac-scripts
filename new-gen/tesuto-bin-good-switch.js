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

function generateIsCensored(lenToStr, varName, splitInt = Infinity) {

  const cases2 = Object.keys(lenToStr).reduce(([left, right], key) => {

    let acc = left;
    if (parseInt(key) > splitInt) {
      acc = right;
    }
    acc.push(
      `case ${key}:
        s = ${JSON.stringify( lenToStr[key] )}; break;
      `)
    return [left, right];

  }, [[],[]]);

  return !cases2[1].length
    ? `
      function is_${varName}_censored(word){

        let s = '';
        switch(word.length) {
          __CASES__
        }
        return ifFoundByBinaryInString(s, word);

      }
      `.replace('__CASES__', cases2[0].join('\n'))
    : `
      function is_${varName}_censored(word){

        let s = '';
        if (word.length <= ${splitInt}) {

          switch(word.length) {
            __CASES1__
          }

        } else {

          switch(word.length) {
            __CASES2__
          }

        }
        return ifFoundByBinaryInString(s, word);

      }
      `.replace('__CASES1__', cases2[0].join('\n'))
      .replace('__CASES2__', cases2[1].join('\n'));

}

function generateDataExpr(hosts, ips) {

  const ipLenToStr = toLenToStr(ips);
  const hostLenToStr = toLenToStr(hosts);

  const isIpCensored = generateIsCensored( ipLenToStr, 'ip' ) ;
  const isHostCensored = generateIsCensored( hostLenToStr, 'host', 100 );

  return `
    ${isIpCensored};
    ${isHostCensored};
  `;

}

function generateUncensorByIpExpr(ips, indent) {

  return 'is_ip_censored(ip)';

}

const areSubsCensoredStr = generateAreSubsCensored(
  (sub) => `is_host_censored(${sub})`
);

function generateUncensorByHostExpr(hosts, indent) {

  return 'areSubsCensored(host)'

};


module.exports = {
  requiredFunctions: [ifFoundByBinaryInString, areSubsCensoredStr],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateUncensorByHostExpr,
    isCensoredByIpExpr: generateUncensorByIpExpr,
  }
};
