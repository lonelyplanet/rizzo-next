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
    playWhenInView = false,
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
    this.playWhenInView = playWhenInView;

    this.defaultAspectRatio = 1.77777778;
    this.events = {};
    this.isReady = false;
    this.on("ready", () => { this.isReady = true; });
    this.setup();
  }

  /**
   * Use this to change any properties of the player after initialization.
   * There is no default logic for this method as changing some properties may
   * involve complex operations rather than simply changing the properties
   * on the instance.
   * Warning: This is implemented as needed and currently only covers "autoplay"
   * and "videoId" on Brightcove players.
   */
  set(options) {
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
