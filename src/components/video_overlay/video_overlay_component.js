import Overlay from "../overlay";
import waitForTransition from "../../core/utils/waitForTransition";
import Video from "../video";

/**
 * Video Overlay Component
*/
export default class VideoOverlay extends Overlay {

  initialize (options) {
    super.initialize(options);

    this.resizeBound = false;

    Video.addPlayer(this.$el.find(".video-overlay__video__container")[0]).then(this.playerReady.bind(this));
  }

  show () {
    super.show();
    this.calculateDimensions();
    if (!this.resizeBound) {
      this.resizeBound = true;
      $(window).resize(this.calculateDimensions.bind(this));
    }
    this.$el.addClass("video-overlay--visible");
    return waitForTransition(this.$el).then(() => {
        this.player.start();
    });
  }

  hide () {
    return super.hide().then(() => {
      this.$el.removeClass("video-overlay--visible");
    });
  }

  onClick () {
    super.onClick();

    if (this.player) {
      this.player.pause();
    }

    this.hide();
  }

  calculateDimensions () {
    if (!this.player) {
      return;
    }

    let maxHeight = $(window).innerHeight() - this.$el.find(".video-overlay__close").outerHeight();
    let maxWidth = $(".lp-global-header__container").innerWidth();
    let containerWidth = this.$el.find(".video-overlay__video__container").innerWidth();
    if (maxWidth > containerWidth) {
      maxWidth = containerWidth;
    }

    let ideal = this.player.getIdealDimensions(maxWidth, maxHeight);

    $(this.player.videoEl).css({ width: ideal.width, height: ideal.height });
  }

  /**
  * Callback from the player "ready" event
  * @param  {VideoPlayer} player - Instance of the VideoPlayer
  */
  playerReady (player) {
    this.player = player;
    this.player.fetchVideos().then(this.fetchDone.bind(this));
  }

  /**
  * Callback from the player loadVideo()
  * @param  {bool} success - depicting whether at least one video is available or not
  */
  fetchDone (success) {
    if (!success) {
      return;
    }

    this.trigger("video.loaded");
  }
}
