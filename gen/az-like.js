'use strict';

function generateIfByHost(hosts, indent) {

  const d_ad = [];
  const d_eh = [];
  const d_il = [];
  const d_mp = [];
  const d_qt = [];
  const d_uz = [];
  const d_other = [];

  hosts.forEach( function(host) {

    var t;
    if (/^[a-d]/.test(host)) t = d_ad;
    else if (/^[e-h]/.test(host)) t = d_eh;
    else if (/^[i-l]/.test(host)) t = d_il;
    else if (/^[m-p]/.test(host)) t = d_mp;
    else if (/^[q-t]/.test(host)) t = d_qt;
    else if (/^[u-z]/.test(host)) t = d_uz;
    else t = d_other;
    t.push(host)

  });

  function ifUncensorByHostAz() {

    var d_ad = __D_AD__;
    var d_eh = __D_EH__;
    var d_il = __D_IL__;
    var d_mp = __D_MP__;
    var d_qt = __D_QT__;
    var d_uz = __D_UZ__;
    var d_other = __D_OTHER__;

    if (/\.(ru|co|cu|com|info|net|org|gov|edu|int|mil|biz|pp|ne|msk|spb|nnov|od|in|ho|cc|dn|i|tut|v|dp|sl|ddns|livejournal|herokuapp|azurewebsites)\.[^.]+$/.test(host))
      host = host.replace(/(.+)\.([^.]+\.[^.]+\.[^.]+$)/, "$2");
    else
      host = host.replace(/(.+)\.([^.]+\.[^.]+$)/, "$2");

    var curarr;
    if (/^[a-d]/.test(host)) curarr = d_ad;
    else if (/^[e-h]/.test(host)) curarr = d_eh;
    else if (/^[i-l]/.test(host)) curarr = d_il;
    else if (/^[m-p]/.test(host)) curarr = d_mp;
    else if (/^[q-t]/.test(host)) curarr = d_qt;
    else if (/^[u-z]/.test(host)) curarr = d_uz;
    else curarr = d_other;

    for (var i = 0; i < curarr.length; i++) {
      if (host === curarr[i]) {
        return true;
      }
    }

    return false;

  };

  const toJson = (o) => JSON.stringify(o, null, ' ');

  return ifUncensorByHostAz.toString()
    .replace('__D_AD__', toJson(d_ad))
    .replace('__D_EH__', toJson(d_eh))
    .replace('__D_IL__', toJson(d_il))
    .replace('__D_MP__', toJson(d_mp))
    .replace('__D_QT__', toJson(d_qt))
    .replace('__D_UZ__', toJson(d_uz))
    .replace('__D_OTHER__', toJson(d_other));

};

function generateIfByIp(ips, indent) {
  return 'function() { return false; }';
}

module.exports = {
  generate: {
    ifByHostAsString: generateIfByHost,
    ifByIpAsString: generateIfByIp,
  }
};
