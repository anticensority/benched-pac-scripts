// 'use strict'; Let PAC-script decide for itself.

const Fs = require('fs');
const Benchmark = require('benchmark');

const args = process.argv.slice(2);
if (!args.length) {
  console.error('ARGS: ./one.pac ./two.pac ... ./last.pac');
}

const pacEnv = Fs.readFileSync('./env.js');

const executePac = function createPac(pacStr) {

  (new Function (
    'url', 'host',
    pacEnv + ';' + pacStr + '; FindProxyForURL(url, host);')
  )('http://mmmmzzztorrent.net', 'mmmmzzztorrent.net');

}

const suite = new Benchmark.Suite;
const opts = {
  async: false,
  minSamples: 200
};

args.map((path) => [path, Fs.readFileSync(path).toString()]).forEach(([path, content]) => {
  suite.add(path, function() {
    executePac(content);
  }, opts)
});

suite.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('error', function(event) { console.log(event) })
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run();


