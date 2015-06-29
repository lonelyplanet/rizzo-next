import { Component } from "../../core/bane";

class Strapline extends Component {
  initialize(options) {
    this.straplineCount = this.$el.length - 1;
    this.currentIndex = this.straplineCount;
    this.differential = options.differential || 500;
  }
  next() {
    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = this.straplineCount;
    }

    this.$el.not(this.currentIndex).removeClass("visible");

    setTimeout(() => {
      this.$el.eq(this.currentIndex).addClass("visible");
    }, this.differential);
  }
}

export default Strapline;
