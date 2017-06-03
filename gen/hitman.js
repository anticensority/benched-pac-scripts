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

    acc[hash(ch)] = charToArr[ch].sort();
    return acc;

  }, []);

  return `function () {

    return (${IfBin.toString()})(${JSON.stringify(theArr)}[(${hash.toString()})(host)], host);

  }`;

};

function generateIfByIp(ips, indent) {

  throw new Error('NOT IMPLEMENTED!');

}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
