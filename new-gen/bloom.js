'use strict';

const Fs = require('fs');
const bloomPath = require.resolve('./libs/bloomfilter.js');
const bloomfilterAsText = Fs.readFileSync(bloomPath);
const BloomFilter = require(bloomPath).BloomFilter;

const generateAreSubsCensored = require('./libs/generate-are-subs-censored');

function generateDataExpr(hosts, ips) {

  const p = 0.001;
  const calc = (n) => {

    const m = Math.round( - n*Math.log(p) / Math.pow(Math.log(2),2) );
    const k = Math.round( - Math.log(p) / Math.log(2) );
    return [m,k];

  };
  const h_calc = calc(hosts.length);
  const [h_m, h_k] = h_calc;
  const ip_calc = calc(ips.length);
  const [ip_m, ip_k] = ip_calc;
  const calcs = [h_calc, ip_calc];

  const [hostsBucketsJson, ipsBucketsJson] = [hosts, ips].map((words, i) => {

    const bloom = words.reduce((bloom, word) =>
      {

        bloom.add(word);
        return bloom;

      },
      new BloomFilter(...calcs[i])
    );

    const arr = [].slice.call(bloom.buckets);
    return JSON.stringify(arr);

  });
  return `
    ${bloomfilterAsText};
    const ipsBloom = new BloomFilter(${ipsBucketsJson}, ${ip_k});
    const hostsBloom = new BloomFilter(${hostsBucketsJson}, ${h_k});
  `;

}

const areSubsCensoredStr = generateAreSubsCensored((sub) => `hostsBloom.test(${sub})`);

function generateUncensorByHostExpr(hosts, indent) {


  return `areSubsCensored(host)`;

};

function generateUncensorByIpExpr(ips, indent) {

  return `ipsBloom.test(ip)`;

}

module.exports = {
  requiredFunctions: [areSubsCensoredStr],
  generate: {
    dataExpr: generateDataExpr,
    isCensoredByHostExpr: generateUncensorByHostExpr,
    isCensoredByIpExpr: generateUncensorByIpExpr,
  }
};
