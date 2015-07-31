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
  }
  setup() {
    // Overwrite this
  }
  play() {
    this.$el.css("zIndex", 9999);
    this.$el.addClass("video-overlay--playing");

    this.isPlaying = true;
  }
  pause() {
    this.$el.removeClass("video-overlay--playing");

    waitForTransition(this.$el).then(() => {
      this.$el.css("zIndex", -20);
    });

    this.isPlaying = false;
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
