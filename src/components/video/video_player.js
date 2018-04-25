import { Component } from "../../core/bane";

class VideoPlayer extends Component {

  initialize({
    playerId,
    playerName = "default",
    videoId = null,
    autoplay = false,
    poster = null,
    controls = true,
    seo = true,
    popout = false,
    cover = false,
    muted = false,
    playsInline = false,
    playWhenInView = false,
    pauseWhenOutOfView = false,
    outOfViewThreshold = 0.5,
    insertPixel = true,
  }) {

    this.playerId = playerId;
    this.videoId = videoId;
    this.autoplay = autoplay;
    this.poster = poster;
    this.playerName = playerName;
    this.seo = seo;
    this.controls = controls;
    this.popout = popout;
    this.cover = cover;
    this.muted = muted;
    this.playsInline = playsInline;
    this.playWhenInView = playWhenInView;
    this.pauseWhenOutOfView = pauseWhenOutOfView;
    this.outOfViewThreshold = outOfViewThreshold;
    this.insertPixel = insertPixel;

    this.defaultAspectRatio = 1.77777778;
    this.events = {};
    this.isReady = false;
    this.on("ready", () => { this.isReady = true; });
    this.setup();
  }

  /**
   * Use this to change any properties of the player after initialization.
   * There is very simple default logic for this method and it is expected
   * that subclasses will have complex operations rather than simply copying
   * the properties to the instance.
   * Warning: This is implemented as needed and currently only covers "autoplay",
   * "playWhenInView", and "videoId" on Brightcove players.
   *
   * This is currently only used in github.com/lonelyplanet/marketing.git
   * at app/pages/best_in_travel/components/video_gallery.js
   */
  set(options) {
    Object.assign(this, options);
  }

  /**
   * Run any setup to load the player (ex. videojs player).
   * Make sure this.trigger("ready") is called within this function.
   */
  setup() {
    this.trigger("ready");
  }

  /**
   * Kills the underlying player (removing it from the page and any references to it)
   * Make sure this.trigger("disposed") is called within this function.
   */
  dispose() {
    this.trigger("disposed", this);
  }

  /**
   * Plays the underlying player
   */
  play() {
  }

  /**
   * Similar to play(), but should be used when expecting to play through a series of videos.
   */
  start() {
    this.play();
  }

  /**
   * Pauses the underlying player
   */
  pause() {
  }

  /**
   * Loads one or more videos into the players "video cache". (Currently only works with Brightcove)
   */
  fetchVideos() {
  }

}

export default VideoPlayer;
