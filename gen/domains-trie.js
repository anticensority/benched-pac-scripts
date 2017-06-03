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

function trieToSwitch(trie, indent) {

  var _indent = indent || '';
  var indent = _indent + '  ';
  var keys = Object.keys(trie).sort();

  if (!trie[''] && keys.length === 1) {
    var key = keys[0];
    return _indent + 'if (doms.pop() === "'+key+'")\n'+ trieToSwitch(trie[key], indent);
  }

  var cases = '';
  if (trie['']) {
    var values = Object.keys(trie['']).sort();

    if (values.length === 1 && keys.length === 1)
      return _indent + 'return doms.pop() === "'+values[0]+'";\n';

    cases = values.filter( function(v) { return v; } ).map( function(val) { return indent +'case "'+val+'":\n'; } ).join('')
       + indent +'  return true;\n';

    delete trie[''];
    keys = Object.keys(trie).sort();
  }

  cases += keys.filter( function(k) { return k; } ).map(
    function(key) {
      var tmp = trieToSwitch( trie[key], indent+'  ');
      if (!/^\s*return/.test(tmp))
        tmp += indent+'  break;\n';
      return indent +'case "'+key+'":\n' +tmp;
    }).join('');

  return ''
  + _indent +'switch( doms.pop() ) {\n'
  + cases
  + _indent +'}\n';
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

  return ifUncensorByHostTrie.toString().replace('__SWITCH__;', trieToSwitch(hostsTrie, indent));

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

  return ifUncensorByIpTrie.toString().replace('__SWITCH__;', trieToSwitch(ipsTrie, indent));

}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
