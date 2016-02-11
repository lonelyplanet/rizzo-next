import { Component } from "../../core/bane";
import track from "../../core/decorators/track";
import waitForTimeout from "../../core/utils/waitForTransition";
import Overlay from "../overlay";

class TopPlaces extends Component {
  initialize() {
    this.events = {
      "touchend a": "goTo"
    };

    this.$html = $("html");
    this.$body = $("body");

    // Remove from dom
    this.$el.detach();

    // New overlay instance
    this.overlay = new Overlay();

    // Events
    this.$body.on("click", ".js-top-places", this.show.bind(this));
    this.$body.on("keyup", this.onKeyup.bind(this));
    this.$el.on("click", "[class*='__close']", this.hide.bind(this));
    this.listenTo(this.overlay, "click", this.hide);
  }

  /**
   * Handle touch events on top places
   * @param  {[Event]} e 
   */
  goTo(e) {
    let el = $(e.currentTarget),
        link = el.attr("href");
    
    window.location = link;
  }

  toggle() {
    if(this.isOpen){
      this.hide();
    } else {
      this.show();
    }
  }
  @track("Top Places Open").sendReturnValue(false)
  show() {
    if(this.isOpen) {
      return Promise.all([]);
    }

    if(this.$el.parent().length === 0){
      this.$el.appendTo(document.body);
    }

    this.overlay.show();

    // wait a few ticks so transition triggers
    setTimeout(() => {
      this.$el.addClass("top_places--visible");
    }, 10);

    this.isOpen = true;
  }
  @track("Top Places Close").sendReturnValue(false)
  hide() {
    if(!this.isOpen) {
      return Promise.all([]);
    }

    this.isOpen = false;

    this.overlay.hide();

    this.$el.removeClass("top_places--visible");

    waitForTimeout(this.$el)
      .then(() => {
        this.$el.detach();
      });
  }

  onKeyup(e){
    // ESC
    if(e.keyCode === 27 && this.isOpen) {
      this.hide();
    }
  }
}

export default TopPlaces;
