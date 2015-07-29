import Flamsteed from "flamsteed";
import CookieUtil from "../../core/cookie_util";

window.lp = window.lp || {};

window.lp.fs = {
  buffer: [],
  now: () => (Date.now ? Date.now() : new Date().getTime()),
  log: (x) => this.buffer.push({ e: x, t: this.now() }),
  time: (x) => !!window.performance && !!window.performance.now && this.buffer.push( { e: x, t: this.now()})
};

if (window.location.protocol !== "https:") {
  window.lp.fs = new Flamsteed({
    events: window.lp.fs.buffer,
    u: new CookieUtil().getCookie("lpUid") || "",
    schema: "0.3"
  });
}
