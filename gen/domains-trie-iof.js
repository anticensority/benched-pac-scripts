'use strict';

// REVERSED HOSTS SWITCH

function populateTrie(trie, doms) {

  const dom = doms.pop();
  if (!doms.length || doms.length === 1 && doms[0] === 'www') {
    trie[''] = trie[''] || {};
    trie[''][dom] = true;
    return trie;
  }

  if (trie[''] && trie[''][dom]) // Subdomain of a blocked domain.
    return trie;

  trie[dom] = trie[dom] || {};

  populateTrie( trie[dom], doms );
  return trie;

}

function trieToIof(trie, indent) {

  var _indent = indent || '';
  var indent = _indent + '  ';
  var keys = Object.keys(trie).sort();

  if (!trie[''] && keys.length === 1) {
    var key = keys[0];
    return _indent + 'if (doms.pop() === "'+key+'")\n'+ trieToIof(trie[key], indent);
  }

  var cases = '';
  if (trie['']) {
    var values = Object.keys(trie['']).sort();

    if (values.length === 1 && keys.length === 1)
      return _indent + 'return doms.pop() === "'+values[0]+'";\n';

    cases = `if (${JSON.stringify(values, null, ' ')}.indexOf(dom) >= 0) { return true; }`;

    delete trie[''];
    keys = Object.keys(trie).sort();
  }

  cases += keys.filter( function(k) { return k; } ).map(
    function(key) {

      var goDeeperBlock = trieToIof( trie[key], indent+'  ');
      return indent + `if (dom === "${key}") {\n${goDeeperBlock}; return false;}`;

    }).join('');

  return `{
    const dom = doms.pop();
    ${cases}
  }`;
}

function generateIfByHost(hosts, indent) {

  const hostsTrie = {};
  hosts.forEach( function(host) {

    const doms = host.replace(/\.+$/, '').split('.');
    populateTrie(hostsTrie, doms);

  });

  function ifUncensorByHostTrie() {
    var doms = host.split('.');
    __SWITCH__;
    return false;
  }

  return ifUncensorByHostTrie.toString().replace('__SWITCH__;', trieToIof(hostsTrie, indent));

};

function generateIfByIp(ips, indent) {

  const ipsTrie = {};
  ips.forEach( function(ip) {

    const doms = ip.split('.').reverse();
    populateTrie(ipsTrie, doms);

  });

  function ifUncensorByIpTrie() {
    const ip = dnsResolve(host);
    if (!ip) {
      return false;
    }
    var doms = ip.split('.').reverse();
    __SWITCH__;
    return false;
  }

  return ifUncensorByIpTrie.toString().replace('__SWITCH__;', trieToIof(ipsTrie, indent));

}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
