'use strict';

const Fs = require('fs');
const ifFoundByBinary = require('./libs/if-found-by-binary');
const generateAreSubsCensored = require('./libs/generate-are-subs-censored');

const toLenToArr = (words) => {

  let lenToArr = words.reduce((acc, word, i) => {

    acc[word.length] = acc[word.length] || [];
    acc[word.length].push(word);
    return acc;

  }, {});
  lenToArr = Object.keys(lenToArr).reduce((acc, len) => {

    acc[len] = lenToArr[len].sort();
    return acc;

  }, {});
  return lenToArr;

};

function generateIsCensored(lenToArr, varName, splitInt = Infinity) {

  const cases2 = Object.keys(lenToArr).reduce(([left, right], key) => {

    let acc = left;
    if (parseInt(key) > splitInt) {
      acc = right;
    }
    acc.push(
      `case ${key}:
        s = ${JSON.stringify( lenToArr[key] )}; break;
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
        return ifFoundByBinary(s, word);

      }
      `.replace('__CASES__', cases2[0].join('\n'))
    : `
      function is_${varName}_censored(word){

        let s = '';

          switch(word.length) {
            __CASES1__
          }

        if (word.length > ${splitInt}) {

          switch(word.length) {
            __CASES2__
          }

        }
        return ifFoundByBinary(s, word);

      }
      `.replace('__CASES1__', cases2[0].join('\n'))
      .replace('__CASES2__', cases2[1].join('\n'));

}

function generateDataExpr(hosts, ips) {

  const ipLenToArr = toLenToArr(ips);
  const hostLenToArr = toLenToArr(hosts);

  const isIpCensored = generateIsCensored( ipLenToArr, 'ip' ) ;
  const isHostCensored = generateIsCensored( hostLenToArr, 'host', 100 );

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
  requiredFunctions: [ifFoundByBinary, areSubsCensoredStr],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateUncensorByHostExpr,
    isCensoredByIpExpr: generateUncensorByIpExpr,
  }
};
