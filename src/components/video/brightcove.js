/* global videojs */

import VideoPlayer from "./video_player";

class Brightcove extends VideoPlayer {

  get videoEl() {
    if (this.$el.hasClass("video-js")) {
      return this.el;
    }
    return this.$el.find(".video-js")[0];
  }

  initialize(options) {
    super.initialize(options);

    this.defaultAspectRatio = 1.77777778;

    this.events["click .video-js"] = "onClickVideo";
  }

  onClickVideo(event) {
    // Prevent event from bubbling -- added for VideoOverlayComponent
    // to prevent the overlay from closing when the user uses the video embed.
    event.stopPropagation();
  }

  play() {
    super.play();
    this.player.play();
  }

  pause() {
    super.pause();
    this.player.pause();
  }

  setup() {
    let self = this;
    videojs(this.videoEl).ready(function () {
      self.player = this;
      self.setInitialDimensions();
      self.trigger("ready");
    });
  }

  search() {
    try {
      let videoId = "ref:dest_" + window.lp.place.atlasId;
      return Promise.resolve([videoId]);
    }
    catch (e) {
      return Promise.resolve([]);
    }
  }

  searchAndLoadVideo() {
    return this.search().then((videos) => {
      if (videos.length) {
        let videoId = videos[0];
        return this.loadVideo(videoId);
      }
      return new Promise.resolve(false);
    });
  }

  loadVideo(videoId) {
    if (!this.player) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.player.catalog.getVideo(videoId, (error, video) => {
        if (!error) {
          this.player.catalog.load(video);
        }
        resolve(!error);
      });
    });
  }

  /**
  * Used to set the initial dimensions of the video player
  * so that when video data begins to load, it sees that the player is fairly
  * large and loads high-res video data.  We have an issue with Brightcove at the moment
  * where it seems to load lower-res video if the player size is set to "mobile-like" 
  * dimensions, but we want to make sure we always have high-res video loaded (if available).
  */
  setInitialDimensions() {
    let width = 1280;
    let height = width / this.defaultAspectRatio;

    $(this.videoEl).css({ width: width, height: height});
  }

  getIdealDimensions(maxw, maxh) {
    let ratio = this.defaultAspectRatio;
    // If we have video data, use the aspect ratio of the 
    // video as the width-height ratio value
    try {
      let source = this.player.mediainfo.rawSources[0];
      ratio = source.width / source.height;
    }
    catch (e) {}

    let width = maxw;
    let height = maxw / ratio;

    if ((typeof maxh != "undefined") && (height > maxh)) {
      height = maxh;
      width = height * ratio;
    }

    return { width: width, height: height };
  }

}

export default Brightcove;
