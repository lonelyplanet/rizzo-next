import { Component } from "../../core/bane";
import Slideshow from "../slideshow";
import assign from "lodash/object/assign";
import Overlay from "../overlay";

/**
 * Masthead Component
*/
export default class MastheadComponent extends Component {
  initialize(options) {
    this.events = {
      "click .js-play-video": "playVideo"
    };

    this.overlay = new Overlay();
    this.slideshow = new Slideshow(assign({
      el: this.$el.find(".slideshow")
    }, options.slideshow));

     // import Video from "../video";
    require([
        "../video"
      ], (Video) => {
        Video.addPlayer(document.body)
          .then(this.playerReady.bind(this));
      });
  }
   /**
   * Play the video, callback from click handler
   */
  playVideo() {
    this.overlay.show();
    this.player.play(this.videoId);
  }

  /**
   * Callback from the player load event
   * @param  {VideoPlayer} player Instance of the VideoPlayer
   * @listens {play}
   */
  playerReady(player) {
    this.player = player;

    this.player.search(window.lp.place.atlasId)
      .then(this.searchDone.bind(this));

    this.listenTo(this.player, "play", this.onPlay);
    this.listenTo(this.player, "stop", this.onStop);
    this.listenTo(this.player, "pause", this.onStop);
  }

  onPlay() {
    // Use this?
  }

  onStop() {
    // Use?
    this.overlay.hide();
  }

  searchDone(videos) {
    if (videos.length) {
      this.$el.find(".js-play-video").show();
      this.videoId = videos[0];
    }
  }
}
