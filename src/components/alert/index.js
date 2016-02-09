import Component from "../../core/component";
import CookieUtil from "../../core/cookie_util";
import waitForTransition from "../../core/utils/waitForTransition";

require("./_alert.scss");

class Alert extends Component {
  get cookieName() {
    return "dn-hide-banner";
  }
  /**
   * Create a new alert for the top of the page
   * @param  {[object]} options.alert An alert object
   * @param  {[string]} options.alert.type Type of alert
   * @param  {[string]} options.alert.text Text of the alert
   * @param  {[string]} options.alert.link_text String of the link
   * @return {[type]}               [description]
   */
  initialize({ alert, callback }) {
    this.cookieUtil = new CookieUtil();
    if (this.cookieUtil.getCookie(this.cookieName)) {
      return;
    }

    this.alert = alert;
    this.callback = callback;

    this.template = require("./alert.hbs");
    let html = this.template({ alert: this.alert });
    
    this.$el.prepend(html);
    this.$alert = this.$el.find(".alert");
    this.$alert.find(".alert__inner").addClass("is-visible");

    this.events = {
      "click .js-close": "hideAlert",
      "click .js-alert-link": "linkClicked"
    };
  }

  hideAlert() {
    this.cookieUtil.setCookie(this.cookieName, "true", 30);
    this.$alert.removeClass("is-visible");
    return waitForTransition(this.$alert, { fallbackTime: 1000 })
      .then(() => {
        this.$alert.detach();
      });
  }

  linkClicked() {
    this.callback && this.callback();
  }
}

export default Alert;
