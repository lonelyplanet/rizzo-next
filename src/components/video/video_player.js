import { Component } from "../../core/bane";
import waitForTransition from "../../core/utils/waitForTransition";

class VideoPlayer extends Component {
  initialize({ playerId }) {
    this.playerId = playerId;
    this.render();
    this.loadPlayer();
    this.events = {
      "click": "pause"
    };

    this.$el
    .addClass("video-overlay")
    .css("zIndex", -20);

    this.$close = this.$el.find(".video-overlay__close__button")
      .addClass("video-overlay__close__button--disabled");
  }
  setup() {
    // Overwrite this
  }
  play() {
    this.$el.css("zIndex", 9999);
    this.$el.addClass("video-overlay--playing");
  }
  pause() {
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
