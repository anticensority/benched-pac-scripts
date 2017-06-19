'use strict';

module.exports = function generateAreSubsCensored(checkSubExpr) {

  return `
    function areSubsCensored(host) {

      var x = host.lastIndexOf('.');
      do {
        x = host.lastIndexOf('.', x - 1);

        if(${checkSubExpr('host.substring(x + 1)')}) {
          return true;
        }
      } while(x > -1);
      return false;

    }`;

};
