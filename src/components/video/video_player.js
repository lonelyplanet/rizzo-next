import { Component } from "../../core/bane";
import waitForTransition from "../../core/utils/waitForTransition";

class VideoPlayer extends Component {

  initialize({ playerId }) {
    this.playerId = playerId;
    this.render();
    this.setup();

    this.events = {
      "click": "pause"
    };
  }

  render() {
    this.$el.addClass("video-overlay");
    this.calculateDimensions();
  }

  /**
   * Run any setup to load the player (ex. videojs player).
   * Make sure this.trigger("ready") is called within this function.
   */
  setup() {
    // calculateDimensions is bound here because it could potentially 
    // be an expensive calculation and we don't want to hook it up
    // unless we're "ready".
    window.onresize = this.calculateDimensions.bind(this);

    this.trigger("ready");
  }

  calculateDimensions() {
    let mastheadHeight = $(".masthead").outerHeight();
    this.$el.css({
      "margin-top": -(mastheadHeight), 
      "height": mastheadHeight
    });
  }

  /**
   * Override to actually play the underlying player
   */
  play() {
    $(".masthead").css("opacity", 0);
    this.$el.css("zIndex", 9999);
    this.$el.addClass("video-overlay--playing");
  }

  /**
   * Override to actually pause the underlying player
   */
  pause() {
    $(".masthead").css("opacity", 1);
    this.$el.removeClass("video-overlay--playing");

    waitForTransition(this.$el).then(() => {
      this.$el.css("zIndex", -20);
    });
  }

}

export default VideoPlayer;
