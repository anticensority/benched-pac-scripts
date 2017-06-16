'use strict';

const ifFoundByBinary = require('./libs/if-found-by-binary');

function hash37(word) {

  const code = word.charCodeAt(0);
  let i;
  if (code < 97/* a */) {
    i = code - 48/* 0 */;
  } else {
    i = 10 + (code - 97);
  }
  return i;

}

function generateIfByHost(sortedHosts, indent) {

  function hash(twoDoms) {
    return twoDoms.map((w) => hash37(w) + w.length).reduce((sum, i) => sum*37 + i, 0) % 100;
  }

  const charToSet = {};
  const suffixToSubs = {};
  const ifNoSub = {};

  sortedHosts.forEach( function(host) {

    const doms = host.split('.');
    const lastTwoArr = doms.slice(-2);
    const lastTwoDoms = lastTwoArr.join('.');
    const i = hash(lastTwoArr);
    const prefix = host.replace(lastTwoDoms, '');
    if (!prefix) {
      ifNoSub[lastTwoDoms] = true;
    } else {
      if(ifNoSub[lastTwoDoms]) {
        return;
      }
    }

    charToSet[i] = charToSet[i] || {};
    charToSet[i][host] = true;

  });

  const toppy = Object.keys(charToSet).sort((iA, iB) => Object.keys(charToSet[iA]).length - Object.keys(charToSet[iB]).length).pop();
  console.error('Most popular suffix is ', toppy, ', it has', Object.keys(charToSet[toppy]).length, 'items:', charToSet[toppy]);

  const theArr = Object.keys(charToSet).sort().reduce((acc, i) => {

    acc[i] = JSON.stringify(Object.keys(charToSet[i]).sort());
    return acc;

  }, Array(100));

  return `
    eval( ${JSON.stringify(theArr)}[

      (${hash.toString()})( host.split('.').slice(-2) )

    ]).some((suffix) => host.endsWith(suffix))
  `;

};

function generateIfByIp(ips, indent) {

  function hash(ip) {

    return parseInt(ip.split('.')[3]);

  }

  const intToArr = {};
  let max = 255;
  while(max >= 0) {
    intToArr[max] = [];
    --max;
  }

  ips.forEach( function(ip) {

    const i = hash(ip);
    intToArr[i] = intToArr[i] || [];
    intToArr[i].push( ip );

  });

  const theArr = Object.keys(intToArr).sort().reduce((acc, i) => {

    acc[i] = JSON.stringify(intToArr[i].sort());
    return acc;

  }, []);

  return `(ip && ifFoundByBinary( eval( ${JSON.stringify(theArr)}[(${hash.toString()})(ip)] ), ip))`;

}

module.exports = {
  requiredFunctions: [hash37, ifFoundByBinary],
  generate: {
    ifUncensorByHostExpr: generateIfByHost,
    ifUncensorByIpExpr: generateIfByIp,
  }
};
