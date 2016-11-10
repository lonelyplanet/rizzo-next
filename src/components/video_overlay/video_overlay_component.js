import Overlay from "../overlay";
import waitForTransition from "../../core/utils/waitForTransition";
import Video from "../video";

/**
 * Video Overlay Component
*/
export default class VideoOverlay extends Overlay {

  initialize (options) {
    super.initialize(options);

    this.defaultAspectRatio = 1.77777778;
    this.resizeBound = false;

    Video.addPlayer(this.el, "brightcove").then(this.playerReady.bind(this));
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
        this.player.play();
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

    let ratio = this.defaultAspectRatio;

    // If we have video data, use the aspect ratio of the 
    // video as the width-height ratio value
    try {
      let source = this.player.player.mediainfo.rawSources[0];
      ratio = source.width / source.height;
    }
    catch (e) {}

    let maxHeight = $(window).innerHeight() - this.$el.find(".video-overlay__close").outerHeight();
    let maxWidth = $(".lp-global-header__container").innerWidth();
    let containerWidth = this.$el.find(".video-overlay__video__container").innerWidth();
    if (maxWidth > containerWidth) {
      maxWidth = containerWidth;
    }
    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    $(this.player.videoEl).css({ width: width, height: height });
  }

  /**
  * Used to set the initial dimensions of the video player
  * so that when video data begins to load, it sees that the player is fairly
  * large and loads high-res video data.  We have an issue with Brightcove at the moment
  * where it seems to load lower-res video if the player size is set to "mobile-like" 
  * dimensions, but we want to make sure we always have high-res video loaded (if available).
  */
  setInitialDimensions () {
    if (!this.player) {
      return;
    }

    let width = 1280;
    let height = width / this.defaultAspectRatio;

    $(this.player.videoEl).css({ width: width, height: height});
  }

  /**
  * Callback from the player "ready" event
  * @param  {VideoPlayer} player Instance of the VideoPlayer
  */
  playerReady (player) {
    this.player = player;

    this.setInitialDimensions();

    this.player.search().then(this.searchDone.bind(this));
  }

  /**
  * Callback from the player search()
  * @param  {videos} list of video ids that matched the search
  */
  searchDone (videos) {
    if (videos.length) {
      let videoId = videos[0];
      this.player.loadVideo(videoId).then(this.loadDone.bind(this));
    }
  }

  /**
  * Callback from the player loadVideo()
  * @param  {success} bool depicting whether the video successfully loaded or not
  */
  loadDone (success) {
    if (!success) {
      return;
    }

    this.trigger("video.loaded");
  }
}