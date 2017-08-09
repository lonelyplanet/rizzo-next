import { Component } from "../../core/bane";

class VideoPlayer extends Component {

  initialize({ playerId, videoId = null, autoplay = false }) {
    this.playerId = playerId;
    this.videoId = videoId;
    this.autoplay = autoplay;
    this.defaultAspectRatio = 1.77777778;
    this.events = {};
    this.isReady = false;
    this.on("ready", () => { this.isReady = true; });
    this.setup();
  }

  /**
   * Run any setup to load the player (ex. videojs player).
   * Make sure this.trigger("ready") is called within this function.
   */
  setup() {
    this.trigger("ready");
  }

  /**
   * Override to actually kill the underlying player
   */
  dispose() {
    this.trigger("disposed", this);
  }

  /**
   * Override to actually play the underlying player
   */
  play() {
  }

  /**
   * Override to actually pause the underlying player
   */
  pause() {
  }

}

export default VideoPlayer;
