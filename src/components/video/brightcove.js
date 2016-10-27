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
    this.events["click .video-js"] = "onClickVideo";
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

  onClickVideo(event) {
    event.stopPropagation();
  }

  pause() {
    super.pause();
    this.player.pause();
  }

  play() {
    this.calculateDimensions();
    super.play();
    this.player.play();
  }

  setup() {
    window.onresize = this.calculateDimensions.bind(this);

    let self = this;
    videojs(this.videoEl).ready(function () {
      self.player = this;
      self.trigger("ready");
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

  calculateDimensions() {
    super.calculateDimensions();

    let ratio = 1.77777778;

    // If we have video data, use the aspect ratio of the 
    // video as the width-height ratio value
    try {
      let source = this.player.mediainfo.rawSources[0];
      ratio = source.width / source.height;
    }
    catch (e) {}

    let maxHeight = this.$el.innerHeight() - this.$el.find(".video-overlay__close").outerHeight();
    let maxWidth = this.$el.find(".masthead-video__container").innerWidth();
    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    $(this.videoEl).css({width: width, height: height});
  }
}

export default Brightcove;
