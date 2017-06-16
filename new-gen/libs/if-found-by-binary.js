'use strict';

const ifFoundByBinary = function ifFoundByBinary(sortedArray, target) {

  var istart = 0;
  var iend = sortedArray.length - 1;

  while (istart < iend) {
    var imid = (istart + iend) >>> 1;
    if (target > sortedArray[imid]) {
      istart = imid + 1;
    } else {
      iend = imid;
    }
  }

  return sortedArray[iend] === target;

}

module.exports = ifFoundByBinary;
