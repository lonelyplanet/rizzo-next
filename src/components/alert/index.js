import Component from "../../core/component";
import CookieUtil from "../../core/cookie_util";
import subscribe from "../../core/decorators/subscribe";
import waitForTransition from "../../core/utils/waitForTransition";
import RizzoEvents from "../../core/rizzo_events";

require("./_alert.scss");

class Alert extends Component {

  initialize() {
    this.cookieUtil = new CookieUtil();
    if (this.cookieUtil.getCookie("dn-opt-in")) {
      return;
    }

    this.alert = {
      alert_type: "default",
      alert_text: "Return to old experience?",
      alert_link_text: "Leave beta"
    };

    this.template = require("./alert.hbs");
    this.$el.prepend($(this.template(this.alert)));
    this.$alert = this.$el.find(".alert");

    this.events = {
      "click .js-close": "hideAlert",
      "click .js-alert-link": "removeCookies"
    };

    this.subscribe();
  }

  @subscribe(RizzoEvents.LOAD_BELOW, "events")
  show() {
    this.$alert.find(".alert__inner").addClass("alert__inner--is-visible");
  }

  hideAlert() {
    this.cookieUtil.setCookie("dn-opt-in", "true", 30);
    this.$alert.removeClass("alert--is-visible");
    return waitForTransition(this.$alert, { fallbackTime: 1000 })
      .then(() => {
        this.$alert.detach();
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
