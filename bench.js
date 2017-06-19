// 'use strict'; Let PAC-script decide for itself.

const Fs = require('fs');
const Benchmark = require('benchmark');

const args = process.argv.slice(2);
if (!args.length) {
  console.error('ARGS: ./one.pac ./two.pac ... ./last.pac');
}

const pacEnv = Fs.readFileSync('./env.js');

const makePac = function createPac(pacStr) {

  return (new Function (
    pacEnv + ';' + pacStr + '; return FindProxyForURL;')
  )();

}

const suite = new Benchmark.Suite;
const opts = {
  async: false,
  minSamples: 400,
};

args.map((path) => [path, Fs.readFileSync(path).toString()]).forEach(([path, content]) => {

  const pacScript = makePac(content);

  const host = 'example.com';
  // const host = 'm.mmmmmabc.ru';
  // const host = 'm.ru.leonnavi.com';
  const url = `http://${host}`;

  suite.add(path, function() {
    pacScript(host, url);
  }, opts);

});

suite.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('error', function(event) { console.log(event) })
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run();


