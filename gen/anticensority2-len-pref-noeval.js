'use strict';

const ifFoundByBinary = require('./libs/if-found-by-binary');

function generateIfUncensorByHost(sortedHosts, indent) {

  function hash(domain2) {

    const code = domain2.charCodeAt(0);
    let i;
    if (code < 97/* a */) {
      i = code - 48/* 0 */;
    } else {
      i = 10 + (code - 97);
    }
    return (i + domain2.length) % 37;

  }

  const charToSet = {};
  const suffixToSubs = {};
  const ifNoSub = {};

  sortedHosts.forEach( function(host) {

    const dom2 = host.split('.').slice(-2)[0];
    const i = hash(dom2);
    const doms = host.split('.');
    const lastTwoDoms = doms.slice(-2).join('.');
    charToSet[i] = charToSet[i] || {};
    charToSet[i][lastTwoDoms] = true;
    const prefix = host.replace(lastTwoDoms, '').replace(/\.$/g, '');
    if (prefix.length && !ifNoSub[lastTwoDoms]) {
      suffixToSubs[lastTwoDoms] = (suffixToSubs[i] || []);
      suffixToSubs[lastTwoDoms].push(prefix);
    } else {
      ifNoSub[lastTwoDoms] = true;
    }

  });

  const toppy = Object.keys(suffixToSubs).sort((sufA, sufB) => suffixToSubs[sufA].length - suffixToSubs[sufB].length)[0];
  console.error('Most popular suffix is ', toppy, ', it has', suffixToSubs[toppy].length, 'subdomains:', suffixToSubs[toppy]);

  const theArr = Object.keys(charToSet).sort().reduce((acc, i) => {

    acc[i] = Object.keys(charToSet[i]).sort();
    return acc;

  }, Array(37));

  return `function () {

    let dom2;
    let lastTwoDoms;
    let prefix;
    {
      const doms = host.split('.');
      const lastTwoArr = doms.slice(-2);
      dom2 = lastTwoArr[0];
      lastTwoDoms = lastTwoArr.join('.');
      prefix = doms.slice(0,-2).join('.');
    }


    const i = (${hash.toString()})(dom2);
    if(
      !ifFoundByBinary(
        ${JSON.stringify(theArr)}[i],
        lastTwoDoms
      )
    ) {
      return false;
    }
    const subdoms = ${JSON.stringify(suffixToSubs)}[lastTwoDoms];
    if (!subdoms) {
      return true;
    }
    if (!prefix) {
      return false;
    }
    return subdoms.some((sub) => prefix.endsWith(sub));

  }()`;

};

function generateIfUncensorByIp(ips, indent) {

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

    acc[i] = intToArr[i].sort();
    return acc;

  }, []);

  return `function () {

    return (ip && ifFoundByBinary( ${JSON.stringify(theArr)}[(${hash.toString()})(ip)], ip));

  }()`;

}

module.exports = {
  requiredFunctions: [ifFoundByBinary],
  generate: {
    ifUncensorByHostExpr: generateIfUncensorByHost,
    ifUncensorByIpExpr: generateIfUncensorByIp,
  }
};
