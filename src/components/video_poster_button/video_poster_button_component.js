import { Component } from "../../core/bane";
import Video from "../video";

/**
 * Video Poster Button Component
*/
export default class VideoPosterButtonComponent extends Component {
  initialize () {

    this.playerVisible = false;

    this.events = {
        "click .video-poster-button__inner": "onClick"
    };

    Video.addPlayer(this.el, "brightcove").then(this.playerReady.bind(this));

    $(window).resize(this.resize.bind(this));
  }

  showVideo () {
    if (this.playerVisible) {
      return;
    }
    this.playerVisible = true;

    // Make sure video is proper dimensions before revealing it.
    this.resize();

    let buttonContainer = this.$el.find(".video-poster-button__inner");
    buttonContainer.removeClass("video-poster-button__inner--visible");

    let videoContainer = this.$el.find(".video-poster-button__video");
    videoContainer.addClass("video-poster-button__video--visible");

    this.player.play();
  }

  hideVideo () {
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

  render () {
    let title = "";
    let image = null;
    let description = "";

    try {
        let mediainfo = this.player.player.mediainfo;
        title = mediainfo.name || "";
        image = mediainfo.poster;
        description = mediainfo.description || "";
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

    this.$el.find(".video-poster-button__title").text(title);

    let descriptionEl = this.$el.find(".video-poster-button__description");
    descriptionEl.text(description).show();
    
    if (!description) {
      descriptionEl.hide();
    }

    return this;
  }

  onClick (e) {
    e.preventDefault();
    this.showVideo();
  }

  resize () {
    if (!(this.player && this.player.videoEl)) {
      return;
    }
    let poster = this.$el.find(".video-poster-button__poster");
    let dimensions = this.player.getIdealDimensions(poster.width(), poster.height());
    $(this.player.videoEl).css({ width: dimensions.width, height: dimensions.height });
  }

  /**
    * Callback from the player "ready" event
    * @param {VideoPlayer} player - Instance of the VideoPlayer
    */
  playerReady (player) {
    this.player = player;
    this.listenTo(this.player, "ended", this.onVideoEnded.bind(this));
    this.player.search().then(this.searchDone.bind(this));
  }

  /**
   * Callback from the player "ended" event / when a video finishes playing.
   */
  onVideoEnded () {
    this.hideVideo();
  }

  /**
  * Callback from the player search()
  * @param  {bool} success - depicting whether a video successfully loaded or not
  */
  searchDone (data) {
    if (data.length) {
      let videoId = data[0].id;

      // If this is a 360 video and the user is using an incapatible device, just stop.
      if (this.player.is360Video(videoId) && !this.player.is360VideoSupported()) {
        return;
      }

      let videoContainer = this.$el.find(".video-poster-button__video")[0];

      // Insert the player embed, load the video, and then run this.loadDone when finished.
      (this.player
        .insertPlayer(videoContainer, videoId)
        .then(() => {
          return this.player.loadVideo(videoId);
        })
        .then(this.loadDone.bind(this)));
    }
  }

  /**
   * Run once a video is finished loading in the player
   *
   * @param  {bool} success - depicting whether a video successfully loaded or not
   */
  loadDone (success) {
    if (!success) {
      return;
    }

    this.render();
  }
}