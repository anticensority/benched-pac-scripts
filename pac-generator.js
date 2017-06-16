'use strict';

const Fs = require('fs');
const Punycode = require('punycode');

const Logger = {
  log: console.error,
};

function fetchIgnoredHosts() {

const data = `
vk.com
navalny.zta.lk
youtube.com
www.youtube.com
youtu.be
ytimg.com
cloudfront.net
yt3.ggpht.com
yt4.ggpht.com
s.ytimg.com
i.ytimg.com
habr.ru
habrahabr.ru
article31.club
yandex.ru
mail.ru
r.mail.ru
img.imgsmail.ru
limg.imgsmail.ru
mail.google.com
e.mail.ru
sync.disk.yandex.net
storage.mds.yandex.net
akamaiedge.net
akamai.net
soupcdn.com
`;

  return { content: data.trim().split(/\s*\r?\n\s*/g), ifOk: true };

}

function generatePacFromString(dumpCsv, typeToProxyString, requiredFunctions, generateIfByHost, generateIfByIp) {

  Logger.log('Generate pac from script...');

  const columnsSep = ';';
  const valuesSep = /\s*\|\s*/g;

  var ips   = {};
  var hosts = {
    // Custom hosts
    'archive.org': true,
    'bitcoin.org': true,
    // LinkedIn
    'licdn.com': true,
    'linkedin.com': true,
    // Based on users complaints:
    'koshara.net': true,
    'koshara.co': true
  };

  const ipToMaskStr = {};

  Logger.log('Splitting input...');
  var lines = dumpCsv.split('\n');
  const remoteUpdated = lines[0].trim();
  Logger.log('For each line..');
  const ipv4v6Re = /^(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4})$/i;


  for( var ii = 1; ii < lines.length; ++ii ) {

    var line = lines[ii].trim();
    if (!line) {
      continue;
    }
    var values = line.split( columnsSep );
    var newIps    = values.shift().split( valuesSep );
    var newHosts  = values.shift().split( valuesSep ).map( function(h) { return Punycode.toASCII( h.replace(/\.+$/g, '').replace(/^\*\./g, '').replace(/^www\./g, '') ); } );
    newIps.forEach(   function (ip)   {

      ip = ip.trim();
      if (!ip) {
        return;
      }
      if (ipv4v6Re.test(ip)) {
        ips[ip] = true;
      } else {
        const parts = ip.split('/');
        const addr = parts[0];
        const mask = parts[1];
        if (ipv4v6Re.test(addr)) {
          ipToMaskStr[addr] = mask;
        } else {
          throw new Error('This is not ip:' + ip);
        }
      }

    });
    newHosts.forEach( function (host) {

      host = host.trim();
      if (!host) {
        return;
      }
      if (ipv4v6Re.test(host)) {
        ips[host] = true;
      }
      else {
        hosts[host] = true;
      }

    });

  };
  Logger.log('Done.');

  var res = fetchIgnoredHosts();
  if (res.content) {
    for(var i in res.content) {
      var host = res.content[i];
      delete hosts[host];
    }
  }
  Logger.log('Hosts ignored.');

  ips   = Object.keys(ips).sort();
  hosts = Object.keys(hosts).sort( function(a, b) { return a.split('').reverse() < b.split('').reverse() ? -1 : a !== b ? 1 : 0 } );

  function ifCensoredByMaskedIp(ip, ipToMaskStr) {

    for(blockedIp in ipToMaskStr) {
      if (isInNet(ip, blockedIp, ipToMaskStr[blockedIp])) {
        return true;
      }
    }
    return false;

  }

  function FindProxyForURL(url, host) {
    /*
        Version: 0.1
        The whole PAC script is reevaluated on each call of this function.
        CONF may be changed by client.
        CONF version defines what props it may have, it is meant to match the version of the extension.
        __SUCH_NAMES__ are template placeholders that MUST be replaced for the script to work.
    */

    if (__IS_IE__()) {
      throw new TypeError('https://rebrand.ly/ac-anticensority');
    }

    host = host.replace(/\.+$/, '').toLowerCase(); // E.g. WinHTTP may be nasty.

    function IF_INCLUDED_IN_PROXYING() {
      return ['pornreactor.cc', 'joyreactor.cc'].includes(host);
    }

    function IF_EXCLUDED_FROM_PROXYING() {
      return ['anticensorship-russia.tk'].includes(host);
    }

    var HTTPS_PROXIES = '__HTTPS_PROXIES__'; //'HTTPS proxy.antizapret.prostovpn.org:3143; HTTPS gw2.anticenz.org:443';
    var PROXY_PROXIES = '__PROXY_PROXIES__'; //'PROXY proxy.antizapret.prostovpn.org:3128; PROXY gw2.anticenz.org:8080;';
    var PROXY_STRING  = HTTPS_PROXIES + PROXY_PROXIES + 'DIRECT';

    return (!IF_EXCLUDED_FROM_PROXYING() && (__IF_UNCENSOR_BY_IP__() || __IF_UNCENSOR_BY_HOST__() || IF_INCLUDED_IN_PROXYING()) )? PROXY_STRING : 'DIRECT';

  };

  requiredFunctions = requiredFunctions || [];

  var pacTemplate = '// From repo: ' + remoteUpdated.toLowerCase() + '\n' +
    '"use strict";\n' +
    requiredFunctions.join(';\n') + '\n' +
    FindProxyForURL.toString()
    .replace('__IS_IE__()', '/*@cc_on!@*/!1')
    .replace('__HTTPS_PROXIES__', typeToProxyString.HTTPS || ';' )
    .replace('__PROXY_PROXIES__', typeToProxyString.PROXY || ';' );

  function stringifyCall() {
    var fun = arguments[0];
    var args = [].slice.call( arguments, 1 )
      .map( function(a) { return typeof a !== 'string' ? JSON.stringify(a) : a; } ).join(', ');
    return '(' + fun + ')(' + args + ')';
  }

  const indent = '  ';
  return pacTemplate
    .replace(
      '__IF_UNCENSOR_BY_IP__()', stringifyCall(generateIfByIp(ips, indent))
    ).replace(
      '__IF_UNCENSOR_BY_HOST__()', stringifyCall(generateIfByHost(hosts, indent))
    );

};

module.exports = (generate) => {

  const dumpCsv = Fs.readFileSync('./dump.csv').toString();
  return generatePacFromString(
    dumpCsv,
    { HTTPS: 'HTTPS your_proxy.here:8080;' },
    generate.requiredFunctions,
    generate.ifByHostAsString,
    generate.ifByIpAsString
  );

};

if (require.main === module) {
  // Not imported, but executed!
  const args = process.argv.slice(2);
  const gen = args.shift();
  if (!gen) {
    console.error('ARGS: ./generator-implementation.js');
    process.exit(1);
  }
  const generate = require(gen).generate;
  const pac = module.exports(generate);
  console.log(pac);
}
