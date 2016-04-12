import "./components/analytics";
import rizzo from "rizzo-next";
import GlobalHeader from "./components/header";
import GlobalFooter from "./components/footer";
import FastClick from "fastclick";
import "./core/utils/preload";
import "./core/utils/detect_swipe";
import "./core/event_tracker";
import "./components/ads";
import "./components/svg_icons";
import CookieUtil from "./core/cookie_util";
import postal from "postal/lib/postal.lodash";
import LoginManager from "./components/login/login_manager";
import AdManager from "./core/ads/ad_manager";
import Alert from "./components/alert";

new LoginManager();

// Create LP namespace if it isn't there already
window.lp = window.lp || {};
window.lp.ads = window.lp.ads || {};
window.lp.ads.manager = new AdManager(window.lp.ads).initialize();

rizzo.renderComponent(GlobalHeader, ".lp-global-header");
rizzo.renderComponent(GlobalFooter, ".lp-global-footer");

FastClick.attach(document.body);


if (typeof ENV_PROD !== "undefined" && ENV_PROD) {
  require("trackjs");

  window.onerror = function(message, file, line, col) {
    rizzo.logger.error({
      message, file, line, col
    });
  };
}

let cookie = new CookieUtil();
cookie.setCookie("destinations-next-cookie", true, 14);

// Show cookie notification for EU users
if (cookie.getCookie("lpCurrency") && cookie.getCookie("lpCurrency").match(/GBP|EUR/)) {
  rizzo.renderComponent(Alert, {
    el: "body",
    alert: {
      type: "default",
      text: "We use cookies to improve your experience on our website. You can update your settings",
      link_text: "here",
      link: "http://www.lonelyplanet.com/legal/cookies"
    }
  });
}

if (typeof ENV_PROD !== "undefined" && !ENV_PROD) {
  postal.addWireTap((data, envelope) => {
    console.log(JSON.stringify(envelope));
  });
}

$.support.cors = true;

window.jQuery = $;
$.detectSwipe.preventDefault = false;
