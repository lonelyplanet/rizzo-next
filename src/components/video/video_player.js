import { Component } from "../../core/bane";
import waitForTransition from "../../core/utils/waitForTransition";

class VideoPlayer extends Component {

  // Override with any script paths that need to be loaded
  // before the player can be built
  get scripts() {
    return [];
  }

  initialize({ playerId }) {
    this.playerId = playerId;
    this.render();
    this.loadPlayer();

    this.events = {
      "click": "pause"
    };
  }

  render() {
    this.$el
      .addClass("video-overlay")
      .css("zIndex", -20);

    this.calculateDimensions();
  }

  setup() {
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

  play() {
    $(".masthead").css("opacity", 0);
    this.$el.css("zIndex", 9999);
    this.$el.addClass("video-overlay--playing");
  }

  pause() {
    $(".masthead").css("opacity", 1);
    this.$el.removeClass("video-overlay--playing");

    waitForTransition(this.$el).then(() => {
      this.$el.css("zIndex", -20);
    });
  }

  loadPlayer() {
    this._getScripts(this.scripts);
  }

  _getScripts(scripts) {
    let promises = scripts.map((s) => $.getScript(s));

    $.when(...promises).then(() => {
      this.setup();
    });
  }
}

export default VideoPlayer;
