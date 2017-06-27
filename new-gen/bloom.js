'use strict';

const Fs = require('fs');
const bloomPath = require.resolve('./libs/bloomfilter.js');
const bloomfilterAsText = Fs.readFileSync(bloomPath);
const BloomFilter = require(bloomPath).BloomFilter;

const generateAreSubsCensored = require('./libs/generate-are-subs-censored');

function generateDataExpr(hosts, ips) {

  const [hostsJson, ipsJson] = [hosts, ips].map((words) => {

    const bloom = words.reduce((bloom, word) =>
      {

        bloom.add(word);
        return bloom;

      },
      new BloomFilter(words, 16)
    );

    const arr = [].slice.call(bloom.buckets);
    return JSON.stringify(arr);

  });
  return `
    ${bloomfilterAsText};
    const ipsBloom = new BloomFilter(${ipsJson}, 16);
    const hostsBloom = new BloomFilter(${hostsJson}, 16);
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
