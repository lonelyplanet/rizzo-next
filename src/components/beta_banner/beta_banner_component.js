import CookieUtil from "../../core/cookie_util";

export default class BetaBannerComponent {
  render() {
    this.cookieUtil = new CookieUtil();
    this.$betaBannerTemplate = require("../beta_banner/beta_banner.hbs");
    this.$renderedBanner = $(this.$betaBannerTemplate())
      .prependTo("body");

    this.bindToFeedbackButton();
    this.bindToExitButton();
  }

  bindToFeedbackButton() {
    this.$renderedBanner
    .find("#feedback-beta")
    .on("click", (e) => {
      e.preventDefault();
      window.usabilla_live && window.usabilla_live("trigger", "profile feedback");
    });
  }

  bindToExitButton() {
    this.$renderedBanner
    .find("#exit-beta")
    .on("click", (e) => {
      e.preventDefault();
      this.leaveBeta();
    });
  }

  leaveBeta() {
    this.cookieUtil.removeCookie("_v"); // Remove Variant
    window.location = "//connect.lonelyplanet.com/users/sign_out"; // Sign Out
  }

}
