'use strict';

function getCommonPrefix(left, right) {

  const commonArr = [];
  Array.from(left).every(function (char, i) {

    if (left[i] !== right[i]) {
      return false;
    }
    this.push(char);
    return true;

  }, commonArr);
  return commonArr.join('');

};

function branchFromTrie(fromTrie, label, toTrie) {

  if (label === '') {
    if (toTrie) {
      throw new TypeError('Can\'t branch with empty label to another trie!');
    }
    fromTrie[''] = true;
    return fromTrie;
  }
  const destTrie = toTrie || {};
  fromTrie[label.charAt(0)] = [label, destTrie];
  return destTrie;

}

function terminalBranch(fromTrie, label) {

  return branchFromTrie(fromTrie, label, label === '' ? undefined : {'': true});
  /*
  fromTrie[''] = fromTrie[''] || [];
  fromTrie[''].push(label);
  const ch = label.charAt(0);
  const branch = fromTrie[ch];
  if (!branch) {
    return;
  }
  const [oldLabel, nextTrie] = branch;
  if (oldLabel === label) {
    delete fromTrie[ch];
  } else {
    throw new Error('BRANCH ALREADY EXISTS!');
  }
  */

}

function populateTrie(trie, word) {

  if (word === '') {
    //throw new Error('AVOID EMPTY WORDS!');
    terminalBranch(trie, '');
    return;
  }

  const char = word.charAt(0);
  const ifBranchExists = trie[char];
  if (!ifBranchExists) {
    terminalBranch(trie, word);
    return;
  }
  const [label, subTrie] = trie[char];
  if (word.startsWith(label)) {
    const newWord = word.substr(label.length);
    /*
    if (newWord === '') {
      // word === label
      terminalBranch(trie, word);
    }*/
    return populateTrie(subTrie, newWord);
  }
  const commonPrefix = getCommonPrefix(word, label);
  const firstDiffCharIndex = commonPrefix.length;
  const labelSuffix = label.substr(firstDiffCharIndex);
  const wordSuffix = word.substr(firstDiffCharIndex);
  const midTrie = branchFromTrie(trie, commonPrefix);
  branchFromTrie(midTrie, labelSuffix, subTrie);
  terminalBranch(midTrie, wordSuffix);
  return;

}

function trieToSwitch(trie, indent) {

  const den = indent || '';

  const ifTerminal = (trie) => trie[''];
  const terms = Object.keys(trie)
    .filter((ch) => ifTerminal(trie[ch][1]))
    .map((ch) => {

      const terminalLabel = trie[ch][0];
      delete trie[ch];
      return terminalLabel;

    });

  // ${terms.map((t) => `${den}    case "${t}":`).join('\n')}
  let termsSwitch = '';
  if (terms.length) {
    termsSwitch = `if(${JSON.stringify(terms)}.indexOf(tail)) {
${den}    return true;
    }`;
  }

  const chars = Object.keys(trie);
  if (!chars.length) {
    return termsSwitch;
  }
  if (chars.length === 1) {
    const ch = chars[0];
    const [label, nextTrie] = trie[ch];
    return `${termsSwitch}
${den}if (tailTryEat("${label}")) {
${den}  ${trieToSwitch(nextTrie, indent)}
${den}}`;
  }

  const cases = chars.map((ch) => {

    const [label, nextTrie] = trie[ch]
    const nextBody = trieToSwitch( nextTrie, den + '    ');
    return `${den}  case "${ch}": if (tailTryEat("${label}")) {
${nextBody}
${den}  }; break;`;

  }).join('\n');

  return `${termsSwitch}
${den}switch( tail.charAt(0) ) {
${cases}
${den}}`;
}

function generateIfByHost(hosts, indent) {

  const hostsTrie = {};
  hosts.forEach( function(host) {

    host = host.replace(/\.+$/, '');
    populateTrie(hostsTrie, host);

  });

  function ifUncensorByHostTrie() {

    let tail = host;
    const tailTryEat = function(word) {

      if (!tail.startsWith(word)) {
        return false;
      }
      tail = tail.substr(word.length);
      return true;

    };
    __STATEMENTS__;
    return false;

  }

  return ifUncensorByHostTrie.toString().replace('__STATEMENTS__;', trieToSwitch(hostsTrie, indent));

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
