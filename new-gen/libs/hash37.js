'use strict';

module.exports = function hash37(host) {

  const code = host.split('.').slice(-2)[0].charCodeAt(0);
  let i;
  if (code < 97/* a */) {
    i = code - 48/* 0 */;
  } else {
    i = 10 + (code - 97);
  }
  return i;

};
