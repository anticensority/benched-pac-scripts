// 'use strict'; Let PAC-script decide for itself.

const Fs = require('fs');
const Benchmark = require('benchmark');

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('ARGS: ./buggy.pac');
  process.exit(1);
}
const pacPath = args.pop();

const pacEnv = Fs.readFileSync('./env.js');

const executePac = function executePac(pacStr, host) {

  return (new Function (
    'url', 'host',
    pacEnv + ';' + pacStr + '; return FindProxyForURL(url, host);')
  )(`http://${host}`, host);

}

const pacStr = Fs.readFileSync(pacPath).toString();
[
  'kasparov.ru',
  'www.kasparov.ru',
].forEach((host) => {

  const result = executePac(pacStr, host);
  console.log(host, result);

});
