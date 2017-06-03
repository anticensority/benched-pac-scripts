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

function generatePacFromString(dumpCsv, typeToProxyString) {

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
      ips[ip] = true;

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

  // COMMON

  const countSorter = (counts) => (a,b) => counts[b] - counts[a];
  const logCounts = (counts) => {

    console.log('================');
    console.log('ALL:', Object.keys(counts).reduce((acc, key) => acc + counts[key], 0));
    console.log('================');
    Object.keys(counts)
      .sort()
      //.sort(countSorter(counts))
      .forEach((ch) => console.log(ch, counts[ch]));

  };

  // HOSTS

  const charToCount = hosts.reduce((charToCount, host) => {

    const ch = host.charAt(0);
    charToCount[ch] = (charToCount[ch] || 0) + 1;
    return charToCount;

  }, {});
  logCounts(charToCount);

  // IPS

  const [fstToCount, fthToCount] = [{}, {}];

  ips.reduce((_, ip) => {

      const [fst, snd, trd, fth] = ip.split('.');
      fstToCount[fst] = (fstToCount[fst] || 0) + 1;
      fthToCount[fth] = (fthToCount[fth] || 0) + 1;

    },
    {}
  );
  logCounts(fstToCount);
  logCounts(fthToCount);

};

module.exports = () => {

  const dumpCsv = Fs.readFileSync('./dump.csv').toString();
  return generatePacFromString(dumpCsv, { HTTPS: 'HTTPS your_proxy.here:8080;' });

};

if (require.main === module) {
  module.exports();
}
