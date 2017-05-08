/* global videojs */

import VideoPlayer from "./video_player";

class Brightcove extends VideoPlayer {

  initialize(options) {
    super.initialize(options);

    this.autoplay = false;
    this.videos = [];
    this.currentVideoIndex = null;

    this.events["click .video-js"] = "onClickVideo";
  }

  get videoEl() {
    if (this.$el.hasClass("video-js")) {
      return this.el;
    }
    return this.$el.find(".video-js")[0];
  }

  onClickVideo(event) {
    // Prevent event from bubbling into the UI
    // when the user interacts with the video.
    event.stopPropagation();
  }

  play() {
    super.play();
    this.autoplay = true;
    this.player.play();
  }

  pause() {
    super.pause();
    this.autoplay = false;
    this.player.pause();
  }

  start() {
    this.currentVideoIndex = null;
    this.loadNextVideo();
    this.play();
  }

  setup() {
    let self = this;
    videojs(this.videoEl).ready(function () {
      self.player = this;
      self.player.on("loadstart", self.onPlayerLoadStart.bind(self));
      self.player.on("ended", self.onPlayerEnded.bind(self));
      self.trigger("ready");
    });
  }

  onPlayerLoadStart() {
    this.renderSEOMarkup();
    this.configureOverlays();

    if (this.autoplay) {
      this.player.play();
    }
  }

  onPlayerEnded() {
    if (this.currentVideoIndex >= this.videos.length - 1) {
      this.trigger("ended");
    }
    else {
      this.loadNextVideo();
    }
  }

  fetchVideos() {
    if (!this.player) {
      return Promise.resolve(false);
    }

    let query = null;
    try {
      query = "ref:dest_" + window.lp.place.atlasId;
    }
    catch (e) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.player.catalog.getPlaylist(query, (error, playlist) => {
        if (!error) {
          this.videos = playlist.length ? playlist : [];
        }
        if (this.videos.length) {
          this.loadNextVideo();
          resolve(true);
        }
        else {
          this.player.catalog.getVideo(query, (error, video) => {
            if (!error) {
              this.videos = [video];
              this.loadNextVideo();
            }
            resolve(!error);
          });
        }
      });
    });
  }

  loadNextVideo() {
    if (!this.player || !this.videos.length) {
      return;
    }

    this.currentVideoIndex = this.currentVideoIndex === null ? 0 : this.currentVideoIndex + 1;
    this.currentVideoIndex = this.currentVideoIndex > this.videos.length - 1 ? 0 : this.currentVideoIndex;

    this.player.catalog.load(this.videos[this.currentVideoIndex]);
  }

  /**
   * Gets the ideal dimensions of the video, considering it's aspect ratio.
   * @param {number} maxw - (required) Maximum width to return (pixels)
   * @param {number} maxh - (optional) Maximum height to return (pixels)
   * @return {Object} object with 'width' and 'height' attributes
   */
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

  configureOverlays() {
    if (!this.player) {
      return;
    }

    const overlays = [{
      content: "<div class=\"video__ad-overlay\">Advertisement</div>",
      align: "top-left",
      start: "ads-ad-started",
      end: "playing",
    }];

    this.player.overlay({
      content: "",
      overlays,
      showBackground: false,
      attachToControlBar: true,
      debug: false,
    });
  }

  /**
   * Retrieves metadata from the currently loaded video
   * @param {string} name - The metadata attribute to retrieve a value for
   * @returns The metadata value, or undefined if unable to retrieve the value
   */
  getVideoProperty (name) {
    if (!this.player || !this.player.mediainfo) {
      return;
    }

    return this.player.mediainfo[name];
  }

  /**
   * Uses the currently loaded video data to build a block of
   * LD-JSON Schema.org markup and appends it to the "head" tag
   *
   * This is run automatically when any video is loaded.
   */
  renderSEOMarkup () {
    if (!this.player || !this.player.mediainfo) {
      return;
    }

    let videoId = this.getVideoProperty("id");
    let scriptId = "ldjson-video-" + videoId;
    let script = document.getElementById(scriptId);
    if (script) {
      return;
    }

    let defaultDescription = "";
    try {
      defaultDescription = window.lp.place.name;
    }
    catch (e) {
    }

    // Duration must be in ISO 8601 format
    // https://en.wikipedia.org/wiki/ISO_8601#Durations
    // Brightcove returns the number of seconds (ex. 161.685)
    let seconds = Math.ceil(this.getVideoProperty("duration"));
    let duration = "PT" + seconds + "S";

    let embedUrl = "https://players.brightcove.net/5104226627001/default_default/index.html?videoId=" + videoId;

    let data = {
      "@context": "http://schema.org",
      "@type": "VideoObject",
      "name": this.getVideoProperty("name") || defaultDescription,
      "description": this.getVideoProperty("description") || defaultDescription,
      "thumbnailURL": this.getVideoProperty("thumbnail"),
      "embedURL": embedUrl,
      "duration": duration,
      "uploadDate": this.getVideoProperty("createdAt"),
    };

    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(data);
    document.getElementsByTagName("head")[0].appendChild(script);
  }

}

export default Brightcove;
