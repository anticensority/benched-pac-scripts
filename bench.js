'use strict';
// 'use strict'; Let PAC-script decide for itself.

const Fs = require('fs');
const Benchmark = require('benchmark');

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('ARGS: ./proxy.pac');
  process.exit(1);
}

const pacEnv = Fs.readFileSync('./env.js');

const makePac = function createPac(pacStr) {

  return (new Function (
    pacEnv + ';' + pacStr + '; return FindProxyForURL;')
  )();

}

const suite = new Benchmark.Suite;

{
  const pacPath = args.pop();
  const dontGc = [];

  const pacScript = makePac(
    Fs.readFileSync(pacPath).toString()
  );
  dontGc.push(pacScript);

  const host = 'example.com';
  // const host = 'm.mmmmmabc.ru';
  // const host = 'm.ru.leonnavi.com';
  const url = `http://${host}`;

  const opts = {
    async: false,
    minSamples: 400,
  };

  suite.add(pacPath, function() {
    pacScript(host, url);
  }, opts);

}

const bytesPerMB = 1 << 20;
const getMemoryUsage = function getMemoryUsage(oldMem = {}) {

  const current = process.memoryUsage();
  for(const prop in current) {
    current[prop] = (current[prop] / bytesPerMB) - (oldMem[prop] || 0);
  }
  return current;

};

let startMem;

gc();
startMem = getMemoryUsage();

suite.on('start', function(event) {
  console.log('START');
})
.on('cycle', function(event) {
  console.log(String(event.target));
  console.log('CYCLE')
})
.on('error', function(event) { console.log(event) })
.on('complete', function() {
  gc();
  const mem = getMemoryUsage(startMem);
  console.log('rss: ' + mem.rss.toFixed(1) + 'M, heapTotal: ' + mem.heapTotal.toFixed(1) + 'M, heapUsed: ' + mem.heapUsed.toFixed(1) + 'M');
})
.run();


