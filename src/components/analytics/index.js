import Flamsteed from "flamsteed";
import CookieUtil from "../../core/cookie_util";

window.lp = window.lp || {};

window.lp.fs = {
  buffer: [],
  now: function() { 
    return (Date.now ? Date.now() : new Date().getTime()); 
  },
  log: function(x) { 
    this.buffer.push({ e: x, t: this.now() }); 
  },
  time: function(x) { 
    !!window.performance && 
    !!window.performance.now && 
    this.buffer.push( { e: x, t: this.now()}); 
  }
};

if (window.location.protocol !== "https:") {
  window.lp.fs = new Flamsteed({
    events: window.lp.fs.buffer,
    u: new CookieUtil().getCookie("lpUid") || "",
    schema: "0.3"
  });
}
