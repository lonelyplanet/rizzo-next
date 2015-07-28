import { Component } from "../../core/bane";

class VideoPlayer extends Component {
  initialize({ playerId }) {
    this.playerId = playerId;
    this.render();
    this.loadPlayer();

    this.events = {
      "click .js-close-video": "pause"
    };

    this.$el.addClass("video-overlay");
  }
  setup() {
    // Overwrite this
  }
  play() {
    this.$el.addClass("video-overlay--playing");
  }
  pause() {
    this.$el.removeClass("video-overlay--playing");
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
