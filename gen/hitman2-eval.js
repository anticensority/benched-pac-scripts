'use strict';

const IfBin = require('./libs/if-binary-found');

function generateIfByHost(hosts, indent) {

  function hash(word) {

    const dom = word.split('.')[0];
    const fst = dom.charCodeAt(0);
    const lst = dom.charCodeAt(dom.length - 1);
    return [fst, lst].reduce((acc, code, i) => {

      let ind;
      if (code < 97/* a */) {
        if (code < 47) {
          ind = code - 45;
        } else {
          ind = 2 + code - 48/* 0 */;
        }
      } else {
        ind = 11 + (code - 97);
      }
      return acc + ind*Math.pow(37, i);

    }, 0);
    // All alphabet is 26 letters + 10 digits + minus = 37 symbols

  }

  const theArr = [];
  let m = 37*37;
  while(m--) {
    theArr[m] = [];
  }

  hosts.forEach( function(host) {

    const ind = hash(host)
    theArr[ind].push( host );

  });

  theArr.forEach((hosts, ind) => {

    theArr[ind] = JSON.stringify( hosts.sort() );

  });

  return `function () {

    return (${IfBin.toString()})( eval( ${JSON.stringify(theArr)}[(${hash.toString()})(host)] ), host);

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
