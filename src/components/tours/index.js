import { Component } from "../../core/bane";
import $clamp from "clamp-js/clamp.js";

require("./_tours.scss");

class ToursComponent extends Component {
  initialize(options) {
    if (this.$el[0]) {
      this.clampAt = options.clampAt || 3;
      this.blurbs = this.$el.find(".js-tour-blurb");
      this.mobileBreak = options.mobileBreak || 518;
      this.headingHeight = options.headingHeight || 18; // lovely magic numbers o_O
      this.nativeSupport = typeof this.$el[0].style.webkitLineClamp !== "undefined";

      if (!$("html").hasClass("ie9")) {
        this._clampText();

        $(window).on("resize", () => {
          this._clampText();
        });
      }
    }
  }
  _clampText() {
    this.blurbs.each((index, blurb) => {
      let heading = $(blurb).prev(),
          headingEl = heading[0],
          headingLines = Math.floor(heading.height() / this.headingHeight),
          blurbClamp = this.clampAt - headingLines + 1,
          headingClamp = 3;

      if (headingLines >= 3) {
        blurbClamp = this.nativeSupport ? 1 : 2;
        $clamp(headingEl, { clamp: headingClamp });
        $clamp(blurb, { clamp: blurbClamp });
      } else {
        if (!this.nativeSupport) {
          blurbClamp++;
        }

        $clamp(blurb, { clamp: blurbClamp });
      }

    });
  }
}

export default ToursComponent;
