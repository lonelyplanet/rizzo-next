import { Component } from "../../core/bane";

class VideoPlayer extends Component {

  initialize({ playerId }) {
    this.playerId = playerId;
    this.events = {};
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
