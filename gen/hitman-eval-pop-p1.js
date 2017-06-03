'use strict';

const IfBin = require('./libs/if-binary-found');

function generateIfByHost(hosts, indent) {

  const charToArr = {};

  hosts.forEach( function(host) {

    const ch = host.charAt(0);
    charToArr[ch] = charToArr[ch] || [];
    charToArr[ch].push( host );

  });

  function hash(word) {

    const code = word.charCodeAt(0);
    let i;
    if (code < 97/* a */) {
      i = code - 48/* 0 */;
    } else {
      i = 10 + (code - 97);
    }
    return i;

  }

  const theArr = Object.keys(charToArr).sort().reduce((acc, ch) => {

    acc[hash(ch)] = JSON.stringify(charToArr[ch].sort());
    return acc;

  }, []);

  return `function () {

    return (${IfBin.toString()})( eval( ${JSON.stringify(theArr)}[(${hash.toString()})(host)] ), host);

  }`;

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

  return `function () {

    const ip = dnsResolve(host);
    return (${IfBin.toString()})( eval( ${JSON.stringify(theArr)}[(${hash.toString()})(ip)] ), ip);

  }`;
    //return (${IfBin.toString()})( ${JSON.stringify(ips)}, dnsResolve(host) );

}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
