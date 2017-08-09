
export default class BetaBannerComponent {
  render() {
    this.$betaBannerTemplate = require("../beta_banner/beta_banner.hbs");
    this.$renderedBanner = $(this.$betaBannerTemplate())
      .prependTo("body");
  }
}
