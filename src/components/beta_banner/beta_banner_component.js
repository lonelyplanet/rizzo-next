import * as Cookie from "js-cookie";

export default class BetaBannerComponent {
  render() {
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
    Cookie.remove("_v", { domain: ".lonelyplanet.com" });// Remove Variant
    // give a little cushion before redirecting
    setTimeout(() => {
      window.location = "//connect.lonelyplanet.com/users/sign_out"; // Sign Out
    }, 500);
  }

}
