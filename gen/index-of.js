'use strict';

function generateIfByHost(hosts, indent) {

  return `function () { return ${JSON.stringify(hosts.sort(), null, ' ')}.indexOf(host) >= 0; }`;

};

function generateIfByIp(ips, indent) {

  return `function () { return ${JSON.stringify(ips.sort(), null, ' ')}.indexOf(dnsResolve(host)) >= 0; }`;

}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
