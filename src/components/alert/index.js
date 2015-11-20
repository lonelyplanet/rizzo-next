import Component from "../../core/component";
import CookieUtil from "../../core/cookie_util";
import subscribe from "../../core/decorators/subscribe";
import waitForTransition from "../../core/utils/waitForTransition";
import RizzoEvents from "../../core/rizzo_events";
// import $ from "jquery";

require("./_alert.scss");

class Alert extends Component {

  initialize() {

    this.cookieUtil = new CookieUtil();
    if (this.cookieUtil.getCookie("dn-opt-in")) {
      return;
    }

    this.alert = {
      alert_type: "default",
      alert_text: "Rerturn to old Experience",
      alert_link_text: "Leave beta"
    };

    this.template = require("./alert.hbs");
    this.$el.prepend($(this.template(this.alert)));
    this.$alert = this.$el.find(".alert");
    // setTimeout(this.show.bind(this), 0);
    // this.$alert.addClass("alert--is-visible");

    this.events = {
      "click .js-close": "hideAlert",
      "click .js-alert-link": "removeCookies"
    };

    this.subscribe();
  }
  @subscribe(RizzoEvents.LOAD_BELOW, "events")
  show() {
    this.$alert.addClass("alert--is-visible");
  }

  hideAlert() {
    this.cookieUtil.setCookie("dn-opt-in", "true", 30);
    alert.removeClass("alert--is-visible");
    return waitForTransition(alert, { fallbackTime: 1000 })
      .then(() => {
        alert.detach();
      });
  }

  removeCookies(e) {
    e.preventDefault();
    this.cookieUtil.removeCookie("_v");
    this.cookieUtil.removeCookie("destinations-next-cookie");
    location.reload();
  }
}

export default Alert;
