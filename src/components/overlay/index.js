import { Component } from "../../core/bane";
import Arkham from "../../core/arkham";
import waitForTransition from "../../core/utils/waitForTransition";
import getScrollbarWidth from "../../core/utils/getScrollbarWidth";
import "./index.scss";

class Overlay extends Component {

  initialize(options = {}){
    this.options = Object.assign(options, {
      preventScroll: true
    });

    this.$html = $("html");
    this.$el.addClass("overlay");

    this.events = {
      "click": "onClick",
      "touchmove": (e) => {
        e.preventDefault();
      }
    };
  }

  toggle(stateOverwrite = undefined){
    let state = stateOverwrite !== undefined ? stateOverwrite : this.isVisible;

    if(state){
      this.show();
    } else {
      this.hide();
    }
  }

  show(){
    // Do nothing if visible
    if(this.isVisible) {
      return Promise.all([]);
    }

    if(this.$el.parent().length === 0){
      this.$el.appendTo(document.body);
    }

    this.isVisible = true;

    getScrollbarWidth()
      .then((scrollWidth) => {
        setTimeout(() => {
          this.$el.addClass("overlay--visible");
        }, 10);

        if (this.options.preventScroll) {
          this.$html.addClass("no-scroll");
        }
        this.$html.css({
          "margin-right": scrollWidth
        });
      });

    return waitForTransition(this.$el);
  }

  hide(){
    // Do nothing if not visible
    if(!this.isVisible) {
      return Promise.all([]);
    }

    this.$el.removeClass("overlay--visible");

    this.isVisible = false;

    return waitForTransition(this.$el)
      .then(() => {
        this.$el.detach();

        if (this.options.preventScroll) {
          this.$html.removeClass("no-scroll");
        }

        this.$html.css({
          "margin-right": 0
        });
      });
  }

  onClick(){
    Arkham.trigger("overlay:click");
    this.trigger("click");
  }
}

export default Overlay;
