import Component from "../../core/component";
import waitForTransition from "../../core/utils/waitForTransition";
// import $ from "jquery";
require("./_alert.scss");

class Alert extends Component {
  initialize() {
    this.events = {
      "click .js-close": (e) => {
        e.preventDefault();
        console.log("close click");
        this.hide();
      }
    }
  }

  hide() {
    this.$el.removeClass("alert--is-visible");

    return waitForTransition(this.$el, { fallbackTime: 1000 })
      .then(() => {
        this.$el.detach();
      });
  }
}

export default Alert;
