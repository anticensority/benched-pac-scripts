'use strict';

function generateIfByHost(hosts, indent) {

  //return `function () { if (${hosts.map( (host) => `"${host}" === host` ).join(') { return true; } else if (')};) { return true; }; return false; }`;
  return `function () { return ${hosts.map( (host) => `"${host}" === host` ).join(' || ')}; }`;

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
