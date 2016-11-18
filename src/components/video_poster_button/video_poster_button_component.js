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

  }

  showVideo () {
    if (this.playerVisible) {
      return;
    }
    this.playerVisible = true;

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
        title = mediainfo.name;
        image = mediainfo.poster;
        description = mediainfo.description;
    }
    catch (e) {
    }

    if (!image) {
        this.$el.removeClass("video-poster-button--visible");
    }

    let imageEl = this.$el.find(".video-poster-button__poster")[0];
    imageEl.onload = () => {
      $(this.player.videoEl).css({ width: "100%", height: "100%" });
      this.$el.addClass("video-poster-button--visible");
    };
    imageEl.src = image;

    this.$el.find(".video-poster-button__title").text(title);

    // TEMP
    description = "Test Description goes here.  Check out Ireland!  You think you can just be part of the team whenever you want? You gotta work for it!  and travel ;)";

    this.$el.find(".video-poster-button__description").text(description);

    return this;
  }

  onClick (e) {
    e.preventDefault();
    this.showVideo();
  }

  /**
    * Callback from the player "ready" event
    * @param  {VideoPlayer} player - Instance of the VideoPlayer
    */
  playerReady (player) {
    this.player = player;
    this.player.searchAndLoadVideo().then(this.loadDone.bind(this));
  }

  /**
  * Callback from the player searchAndLoadVideo()
  * @param  {bool} success - depicting whether a video successfully loaded or not
  */
  loadDone (success) {
    if (!success) {
      return;
    }

    this.render();
  }
}