'use strict';

module.exports = function hash37(word) {

  const code = word.charCodeAt(0);
  let i;
  if (code < 97/* a */) {
    i = code - 48/* 0 */;
  } else {
    i = 10 + (code - 97);
  }
  return i;

};
