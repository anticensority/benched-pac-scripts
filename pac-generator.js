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
anticensority.pac
`;

  return { content: data.trim().split(/\s*\r?\n\s*/g), ifOk: true };

}

function convert_addr(ipchars) {
    var bytes = ipchars.split('.');
    var result = ((bytes[0] & 0xff) << 24) |
                 ((bytes[1] & 0xff) << 16) |
                 ((bytes[2] & 0xff) <<  8) |
                  (bytes[3] & 0xff);
    return result;
}

function generatePacFromString(dumpCsv, ifToCut, typeToProxyString, requiredFunctions, generateDataExpr, mutateHostExpr, generateIsCensoredByHostExpr, generateIsCensoredByIpExpr) {

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

  const ipIntToMaskInt = {};
  const ipIntToMaskedStr = {};

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

  const cut = function cut(host) {

    if (/\.(ru|co|cu|com|info|net|org|gov|edu|int|mil|biz|pp|ne|msk|spb|nnov|od|in|ho|cc|dn|i|tut|v|dp|sl|ddns|livejournal|herokuapp|azurewebsites)\.[^.]+$/.test(host)) {
      return host.replace(/(.+)\.([^.]+\.[^.]+\.[^.]+$)/, '$2');
    }
    return host.replace(/(.+)\.([^.]+\.[^.]+$)/, '$2');

  };

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
        const ipAddrStr = parts[0];
        if (!( parts.length === 2 && ipv4v6Re.test(ipAddrStr) )) {
          throw new Error('Can\'t parse ip:' + ip);
        }
        const cidrInt = parseInt(parts[1]);
        const maskInt = cidrInt && -1 << (32 - cidrInt);
        const ipAddrInt = convert_addr(ipAddrStr) & maskInt;
        ipIntToMaskInt[ipAddrInt] = maskInt;
        ipIntToMaskedStr[ipAddrInt] = (ipAddrInt >>> 0).toString(2).slice(0, cidrInt);

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

      if (ifToCut) {
        host = cut(host);
      }

      hosts[host] = true;

    });

  };
  Logger.log('Done.');

  ips   = Object.keys(ips).sort();
  //hosts = Object.keys(hosts).sort( function(a, b) { return a.split('').reverse() < b.split('').reverse() ? -1 : a !== b ? 1 : 0 } );
  hosts = Object.keys(hosts).sort();

  // Remove subnets of other nets.
  const i2ms = ipIntToMaskedStr;
  Object.keys(i2ms).forEach((ipInt) => {

    const prefix = i2ms[ipInt];
    const ifSubbed = Object.keys(i2ms).some( (ipInt2) => ipInt2 !== ipInt && prefix.startsWith( i2ms[ipInt2] ) );
    if (ifSubbed) {
      delete i2ms[ipInt];
      delete ipIntToMaskInt[ipInt];
    }

  });

  const ipsAsUints = Object.keys(ipIntToMaskInt).map((k) => (k >>> 0)).sort((a,b) => a - b);

  function isCensoredByMaskedIp(ip) {

    const target = convert_addr(ip) >>> 0;
    var istart = 0;
    var iend = ipsAsUints.length - 1;

    while (istart < iend) {
      var imid = Math.ceil((istart + iend)*0.5);
      if (target < ipsAsUints[imid]) {
        iend = imid - 1;
      } else {
        istart = imid;
      }
    }

    const maskedIpInt = ipsAsUints[iend];
    const maskInt = ipIntToMaskInt[ maskedIpInt ];
    return (target & maskInt) === maskedIpInt;

    /*
    var hostInt = convert_addr(ip);
    for (var blockedIpInt in ipIntToMaskInt) {
      var maskInt = ipIntToMaskInt[blockedIpInt];
      if((hostInt & maskInt) === blockedIpInt) {
        return true;
      }
    }
    return false;
    */

  }

  var template = function(global) {
    __START__

'use strict';

/*
    Version: 0.2
    __SUCH_NAMES__ are template placeholders that MUST be replaced for the script to work.
*/

if (__IS_IE__()) {
  throw new TypeError('https://rebrand.ly/ac-anticensority');
}

var HTTPS_PROXIES = '__HTTPS_PROXIES__'; //'HTTPS proxy.antizapret.prostovpn.org:3143; HTTPS gw2.anticenz.org:443';
var PROXY_PROXIES = '__PROXY_PROXIES__'; //'PROXY proxy.antizapret.prostovpn.org:3128; PROXY gw2.anticenz.org:8080;';
var PROXY_STRING  = HTTPS_PROXIES + PROXY_PROXIES + 'DIRECT';

__DATA_EXPR__

__REQ_FUNS__

function FindProxyForURL(url, host) {

  // Remove last dot.
  if (host[host.length - 1] === '.') {
    host = host.substring(0, host.length - 1);
  }
  __MUTATE_HOST_EXPR__

  return (function isCensored(){

    // In the worst case both IP and host checks must be done (two misses).
    // IP hits are more probeble, so we check them first.
    const ip = dnsResolve(host);
    if (ip && (__IS_CENSORED_BY_MASKED_IP_EXPR__ || __IS_CENSORED_BY_IP_EXPR__)) {
      return true;
    };

    return (__IS_CENSORED_BY_HOST_EXPR__);

  })() ? PROXY_STRING : 'DIRECT';

}

    __END__
  };

  function stringifyCall() {
    var fun = arguments[0];
    var args = [].slice.call( arguments, 1 )
      .map( function(a) { return typeof a !== 'string' ? JSON.stringify(a) : a; } ).join(', ');
    return '(' + fun + ')(' + args + ')';
  }

  mutateHostExpr = mutateHostExpr || '';
  requiredFunctions = requiredFunctions || [];

  var dataExpr = (generateDataExpr ? generateDataExpr(hosts, ips) : '') + ';'; /*
    + ';\nconst ipIntToMaskInt = ' + JSON.stringify(ipIntToMaskInt)
    + ';\nconst ipsAsUints = ' + JSON.stringify(ipsAsUints) + ';'
  */

  var pacTemplate = (
    '// From repo: ' + remoteUpdated.toLowerCase() + '\n' +
    template.toString()
  )
    .replace(/^[\s\S]*?__START__\s*/g, '')
    .replace(/\s*?__END__[\s\S]*$/g, '')
    .replace('__DATA_EXPR__', dataExpr)
    .replace('__REQ_FUNS__', requiredFunctions.join(';\n'))
    .replace('__MUTATE_HOST_EXPR__', `${ifToCut ? `host = ${cut.toString()}(host);` : '' }${mutateHostExpr}`)
    .replace('__IS_IE__()', '/*@cc_on!@*/!1')
    .replace('__HTTPS_PROXIES__', typeToProxyString.HTTPS || ';' )
    .replace('__PROXY_PROXIES__', typeToProxyString.PROXY || ';' );

  return pacTemplate
    .replace('__IS_CENSORED_BY_IP_EXPR__', generateIsCensoredByIpExpr(ips) )
    .replace('__IS_CENSORED_BY_MASKED_IP_EXPR__', 'false') // stringifyCall(isCensoredByMaskedIp, 'ip'))
    .replace('__IS_CENSORED_BY_HOST_EXPR__', generateIsCensoredByHostExpr(hosts) );

};

module.exports = (generator, ifToCut) => {

  const dumpCsv = Fs.readFileSync('./dump.csv').toString();
  return generatePacFromString(
    dumpCsv,
    ifToCut,
    { HTTPS: 'HTTPS your_proxy.here:8080;' },
    generator.requiredFunctions,
    generator.generate.dataExpr,
    generator.mutateHostExpr,
    generator.generate.isCensoredByHostExpr,
    generator.generate.isCensoredByIpExpr
  );

};

const showHelp = () => {

  console.error('ARGS: cut|nocut ./generator-implementation.js');
  process.exit(1);

};

if (require.main === module) {
  // Not imported, but executed!
  const args = process.argv.slice(2);

  const fst = args.shift();
  if( !['cut', 'nocut'].includes(fst) ) {
    showHelp();
  }
  const ifToCut = fst  === 'cut';

  const gen = args.shift();
  if (!gen) {
    showHelp();
  }
  const generator = require(gen);
  const pac = module.exports(generator, ifToCut);
  console.log(pac);
}
