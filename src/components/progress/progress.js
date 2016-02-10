import { Component } from "../../core/bane";

class ProgressComponent extends Component {
  initialize(options) {
    this.options = options;
    this.$progessBar = this.$el.find(".js-lp-progress-bar");
    this.maxWidth = this.$el.data("max") ? this.$el.data("max") : 100;
  }

  update(width = this.options.width) {
    if (width < 0) width = 0;
    if (width > this.maxWidth) width = this.maxWidth;

    this.$el.data("value", width);
    this.$el.attr("aria-label", `${Math.ceil(width)}%`);
    this.$progessBar.css("width", `${width}%`);
  }

  reset() {
    this.update(0);
  }

  fill() {
    this.update(this.maxWidth);
  }
}

export default ProgressComponent;
