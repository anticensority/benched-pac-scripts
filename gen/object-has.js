'use strict';

function generateIfByHost(hosts, indent) {

  const hostToBool = hosts.reduce(function (acc, host) {

    acc[host] = true;
    return acc;

  }, {});

  return `function () { return ${JSON.stringify(hostToBool, null, ' ')}[host] || false; }`;

};

function generateIfByIp(ips, indent) {

  const ipToBool = hosts.reduce(function (acc, ip) {

    acc[ip] = true;
    return acc;

  }, {});

  return `function () { return ${JSON.stringify(ipToBool, null, ' ')}[dnsResolve(host)] || false; }`;

}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
