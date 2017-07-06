import { Component } from "../../core/bane";
import Video from "../video";

/**
 * Video Poster Button Component
*/
export default class VideoPosterButtonComponent extends Component {
  initialize() {
    this.playerVisible = false;

    this.events = {
        "click .video-poster-button__inner": "onClick"
    };

    Video.addPlayer(this.$el.find(".video-poster-button__video")[0]).then(this.playerReady.bind(this));
  }

  showVideo() {
    if (this.playerVisible) {
      return;
    }
    this.playerVisible = true;

    let buttonContainer = this.$el.find(".video-poster-button__inner");
    buttonContainer.removeClass("video-poster-button__inner--visible");

    let videoContainer = this.$el.find(".video-poster-button__video");
    videoContainer.addClass("video-poster-button__video--visible");

    this.player.start();
  }

  hideVideo() {
    if (!this.playerVisible) {
      return;
    }
    this.playerVisible = false;

    this.player.pause();

    let buttonContainer = this.$el.find(".video-poster-button__inner");
    buttonContainer.addClass("video-poster-button__inner--visible");

    let videoContainer = this.$el.find(".video-poster-button__video");
    videoContainer.removeClass("video-poster-button__video--visible");
  }

  render() {
    this.renderImage();
    this.renderText();
  }

  renderImage() {
    let image = null;

    try {
        const mediainfo = this.player.player.mediainfo;
        image = mediainfo.poster;
    }
    catch (e) {
    }

    if (!image) {
        this.$el.removeClass("video-poster-button--visible");
    }

    let imageEl = this.$el.find(".video-poster-button__poster")[0];
    imageEl.onload = () => {
      this.$el.addClass("video-poster-button--visible");
    };
    imageEl.src = image;
  }

  renderText() {
    let title = "";
    let description = "";

    try {
        const mediainfo = this.player.player.mediainfo;
        title = mediainfo.name || "";
        description = mediainfo.description || "";
    }
    catch (e) {
    }

    this.$el.find(".video-poster-button__title").text(title);
    this.$el.find(".video-poster-button__description").html(description);
  }

  onClick(e) {
    e.preventDefault();
    this.showVideo();
  }

  /**
    * Callback from the player "ready" event
    * @param  {VideoPlayer} player - Instance of the VideoPlayer
    */
  playerReady(player) {
    this.player = player;
    this.listenTo(this.player, "ended", this.onPlayerEnded.bind(this));
    this.listenTo(this.player, "loadstart", this.onPlayerLoadStart.bind(this));
    this.player.fetchVideos().then(this.fetchDone.bind(this));
  }

  /**
   * Callback from the player "ended" event / when the playlist finishes playing.
   */
  onPlayerEnded() {
    this.hideVideo();
  }

  /**
   * Callback from the player "loadstart" event / when a video is loaded and is ready to play.
   */
  onPlayerLoadStart() {
    this.renderText();
  }

  /**
  * Callback from the player fetchVideos()
  * @param  {bool} success - depicting whether at least one video is available or not
  */
  fetchDone(success) {
    if (!success) {
      return;
    }

    this.render();
  }
}
