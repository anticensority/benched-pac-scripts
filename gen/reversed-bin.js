'use strict';

const ifBin = require('./libs/if-binary-found');

function generateIfByHost(hosts, indent) {

  return `function () { return (${ifBin.toString()})(${JSON.stringify(hosts.map((h) => h.split('').reverse().join('')).sort(), null, ' ')}, host.split('').reverse().join('')); }`;

};

function generateIfByIp(ips, indent) {

  throw new Error('NOT IMPLEMENTED');

}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
