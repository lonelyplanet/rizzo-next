import { Component } from "../../core/bane";

class Tooltip extends Component {
  initialize() {
    this.events = {
      mouseenter: "_enter",
      mouseleave: "_leave"
    };

    this.template = require("./tooltip.hbs");
    this.render();
  }
  render() {
    this.$el.addClass("tooltip is-hidden")
      .prepend(this.template());

    return this;
  }
  toggle(state) {
    if (state === "close"){
      this.timer = setTimeout(() => {
        this.$el.addClass("is-hidden");
      }, 200);
    } else {
      this.$el.removeClass("is-hidden");
    }
  }
  _enter() {
    clearTimeout(this.timer);
  }
  _leave() {
    this.toggle("close");
  }
}
export default Tooltip;
