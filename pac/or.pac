// From repo: updated: 2017-03-08 19:00:02 +0000
"use strict";
function FindProxyForURL(url, host) {
    /*
        Version: 0.1
        The whole PAC script is reevaluated on each call of this function.
        CONF may be changed by client.
        CONF version defines what props it may have, it is meant to match the version of the extension.
        __SUCH_NAMES__ are template placeholders that MUST be replaced for the script to work.
    */

    if (/*@cc_on!@*/!1) {
      throw new TypeError('https://rebrand.ly/ac-anticensority');
    }

    host = host.replace(/\.+$/, '').toLowerCase(); // E.g. WinHTTP may be nasty.

    function IF_INCLUDED_IN_PROXYING() {
      return ['pornreactor.cc', 'joyreactor.cc'].includes(host);
    }

    function IF_EXCLUDED_FROM_PROXYING() {
      return ['anticensorship-russia.tk'].includes(host);
    }

    var HTTPS_PROXIES = 'HTTPS your_proxy.here:8080;'; //'HTTPS proxy.antizapret.prostovpn.org:3143; HTTPS gw2.anticenz.org:443';
    var PROXY_PROXIES = ';'; //'PROXY proxy.antizapret.prostovpn.org:3128; PROXY gw2.anticenz.org:8080;';
    var PROXY_STRING  = HTTPS_PROXIES + PROXY_PROXIES + 'DIRECT';


  }