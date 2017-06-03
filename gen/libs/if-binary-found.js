'use strict';

function ifBinaryFound(sortedArray, target) {

  var istart = 0;
  var iend = sortedArray.length - 1;

  while (istart < iend) {
    var imid = istart + Math.floor( (iend - istart)*0.5 );
    if (target > sortedArray[imid])
      istart = imid + 1;
    else
      iend = imid;
  }

  return target === sortedArray[iend];

}

module.exports = ifBinaryFound;
