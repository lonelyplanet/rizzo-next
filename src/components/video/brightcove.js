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
}

export default Brightcove;
