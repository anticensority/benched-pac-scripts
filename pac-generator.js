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

function generatePacFromString(dumpCsv, typeToProxyString, mutateHostExpr, requiredFunctions, generateIfUncensorByHostExpr, generateIfUncensorByIpExpr) {

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

  var ignoredHosts = [];
  var ihRes = fetchIgnoredHosts();
  if (ihRes.content) {
    ignoredHosts = ihRes.content;
  }
  Logger.log('Ignored hosts initiated.');


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
        return;
      }
      if (ignoredHosts.some((ih) => host.endsWith(ih))) {
        return;
      }

      /*var newHost;
      if (/\.(ru|co|cu|com|info|net|org|gov|edu|int|mil|biz|pp|ne|msk|spb|nnov|od|in|ho|cc|dn|i|tut|v|dp|sl|ddns|livejournal|herokuapp|azurewebsites)\.[^.]+$/.test(host)) {
        newHost = host.replace(/(.+)\.([^.]+\.[^.]+\.[^.]+$)/, '$2');
      } else {
        newHost = host.replace(/(.+)\.([^.]+\.[^.]+$)/, '$2');
      }
      if (newHost !== host) {
        //Logger.log(host + ' > ' + newHost);
        host = newHost;
      }
      */

      hosts[host] = true;

    });

  };
  Logger.log('Done.');

  ips   = Object.keys(ips).sort();
  //hosts = Object.keys(hosts).sort( function(a, b) { return a.split('').reverse() < b.split('').reverse() ? -1 : a !== b ? 1 : 0 } );
  hosts = Object.keys(hosts).sort();

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
        Version: 0.2
        __SUCH_NAMES__ are template placeholders that MUST be replaced for the script to work.
    */

    if (__IS_IE__()) {
      throw new TypeError('https://rebrand.ly/ac-anticensority');
    }

    host = host.replace(/\.+$/, '').toLowerCase(); // E.g. WinHTTP may be nasty.
    __MUTATE_HOST_EXPR__;

    function IF_INCLUDED_IN_PROXYING() {
      return [].includes(host);
    }

    function IF_EXCLUDED_FROM_PROXYING() {
      return ['anticensorship-russia.tk'].includes(host);
    }

    var HTTPS_PROXIES = '__HTTPS_PROXIES__'; //'HTTPS proxy.antizapret.prostovpn.org:3143; HTTPS gw2.anticenz.org:443';
    var PROXY_PROXIES = '__PROXY_PROXIES__'; //'PROXY proxy.antizapret.prostovpn.org:3128; PROXY gw2.anticenz.org:8080;';
    var PROXY_STRING  = HTTPS_PROXIES + PROXY_PROXIES + 'DIRECT';

    return (function ifProxy(){

      if (IF_EXCLUDED_FROM_PROXYING()) {
        return false;
      }

      // In the worst case both IP and host checks must be done (two misses).
      // IP hits are more probeble, so we check them first.
      const ip = dnsResolve(host);
      if (ip && (__IF_CENSORED_BY_MASKED_IP_EXPR__ || __IF_CENSORED_BY_IP_EXPR__)) {
        return true;
      };

      return (__IF_CENSORED_BY_HOST_EXPR__ || IF_INCLUDED_IN_PROXYING());

    })() ? PROXY_STRING : 'DIRECT';

  };

  function stringifyCall() {
    var fun = arguments[0];
    var args = [].slice.call( arguments, 1 )
      .map( function(a) { return typeof a !== 'string' ? JSON.stringify(a) : a; } ).join(', ');
    return '(' + fun + ')(' + args + ')';
  }

  mutateHostExpr = mutateHostExpr || '';
  requiredFunctions = requiredFunctions || [];

  var pacTemplate = '// From repo: ' + remoteUpdated.toLowerCase() + '\n' +
    '"use strict";\n' +
    requiredFunctions.join(';\n') + '\n' +
    FindProxyForURL.toString()
    .replace('__MUTATE_HOST_EXPR__', mutateHostExpr)
    .replace('__IS_IE__()', '/*@cc_on!@*/!1')
    .replace('__HTTPS_PROXIES__', typeToProxyString.HTTPS || ';' )
    .replace('__PROXY_PROXIES__', typeToProxyString.PROXY || ';' );

  return pacTemplate
    .replace('__IF_CENSORED_BY_IP_EXPR__', generateIfUncensorByIpExpr(ips) )
    .replace('__IF_CENSORED_BY_MASKED_IP_EXPR__', 'false') // stringifyCall(ifCensoredByMaskedIp, ipToMaskInt))
    .replace('__IF_CENSORED_BY_HOST_EXPR__', generateIfUncensorByHostExpr(hosts) );

};

module.exports = (generator) => {

  const dumpCsv = Fs.readFileSync('./dump.csv').toString();
  return generatePacFromString(
    dumpCsv,
    { HTTPS: 'HTTPS your_proxy.here:8080;' },
    generator.mutateHostExpr,
    generator.requiredFunctions,
    generator.generate.ifUncensorByHostExpr,
    generator.generate.ifUncensorByIpExpr
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
  const generator = require(gen);
  const pac = module.exports(generator);
  console.log(pac);
}
