'use strict';

const ifFoundByBinaryInString = function ifFoundByBinaryInString(sortedArrayJoined, target) {

  var targetLen = target.length;
  var istart = 0;
  var iend = (sortedArrayJoined.length / targetLen) - 1;

  while (istart < iend) {
    var imid = (istart + iend) >>> 1;
    const newWord = sortedArrayJoined.substr( imid * targetLen, targetLen );
    if (target > newWord) {
      istart = imid + 1;
    } else {
      iend = imid;
    }
  }

  return sortedArrayJoined.substr( iend * targetLen, targetLen ) === target;

}

const ifFoundByBinaryInString2 = function ifFoundByBinaryInString(sortedArrayJoined, target) {

  var targetLen = target.length;
  var istart = 0;
  var iend = (sortedArrayJoined.length / targetLen) - 1;

  while (istart < iend) {
    var imid = (istart + iend) >>> 1;
    const offset = imid * targetLen;
    const newWord = sortedArrayJoined.substring( offset, offset + targetLen );
    if (target > newWord) {
      istart = imid + 1;
    } else {
      iend = imid;
    }
  }

  const offset = iend * targetLen;
  return sortedArrayJoined.substring( offset, offset + targetLen ) === target;

}

module.exports = ifFoundByBinaryInString2;
