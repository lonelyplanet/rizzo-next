/* global videojs */

import VideoPlayer from "./video_player";

class Brightcove extends VideoPlayer {

  initialize(options) {
    super.initialize(options);
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
    this.player.play();
  }

  pause() {
    super.pause();
    this.player.pause();
  }

  setup() {
    // let self = this;
    this.player = videojs(this.videoEl);
    this.player.ready(this.onPlayerReady.bind(this));
    this.player.on("loadstart", this.onPlayerLoadStart.bind(this));
    // this.player.on("error", this.onPlayerError.bind(this));
    // this.player.on("playing", this.onPlayerPlaying.bind(this));
    this.player.on("ended", this.onPlayerEnded.bind(this));
    // this.player.on("ads-ad-ended", this.onAdEnded.bind(this));

    // videojs(this.videoEl).ready(function () {
    //   self.player = this;
    //   self.player.on("ended", () => { self.trigger("ended"); });
    //   self.player
    //   self.player.on("loadstart", this.onPlayerLoadStart.bind(this));
    //   self.player.on("error", this.onPlayerError.bind(this));
    //   self.player.on("playing", this.onPlayerPlaying.bind(this));
    //   self.player.on("ended", this.onPlayerEnded.bind(this));
    //   self.player.on("ads-ad-ended", this.onAdEnded.bind(this));
    //   // self.setInitialDimensions();
    //   self.trigger("ready");
    // });
  }

  onPlayerReady() {
    this.trigger("ready");
  }

  onPlayerLoadStart() {
    this.renderSEOMarkup();

    const tt = this.player.textTracks()[0];
    if (tt) {
      tt.oncuechange = this.onPlayerCueChange.bind(this);
    }

    this.configureOverlays();

    // if (this.props.autoplay) {
    //   this.player.play();
    // }
  }

  // onPlayerError() {
  //   this.loadVideo()
  // }

  onPlayerEnded() {
    this.trigger("ended");
  }

  // onAdEnded() {

  // }

  onPlayerCueChange() {
    const tt = this.player.textTracks()[0];
    const activeCue = tt.activeCues[0];
    if (!activeCue || activeCue.text !== "CODE") {
      return;
    }

    const cue = activeCue.originalCuePoint;

    const overlayElementId = `ad-lowerthird-${this.cid}-${cue.id}`;
    const element = document.getElementById(overlayElementId);

    if (!element) {
      return;
    }

    let cueIndex = null;

    this.getCues().forEach((c, i) => {
      if (c.originalCuePoint.id === cue.id) {
        cueIndex = i;
      }
    });

    if (cueIndex === null) {
      return;
    }

    window.lp.analytics.dfp.video.lowerThird(cueIndex + 1, overlayElementId);

    // if (this.props.onCueChange) {
    //   this.props.onCueChange(cue, cueIndex, overlayElementId);
    // }
  }

  getCues() {
    if (!this.player) {
      return [];
    }

    const tt = this.player.textTracks()[0];
    if (!tt) {
      return [];
    }

    let index = 0;
    const cues = [];
    while (index < tt.cues.length) {
      const cue = tt.cues[index];
      if (cue.text === "CODE") {
        cues.push(cue);
      }
      index += 1;
    }

    return cues;
  }

  configureOverlays() {
    const overlays = this.getCues().map((c) => {
      const cue = c.originalCuePoint;

      const defaultEnd = cue.startTime + 15;
      const end = defaultEnd < cue.endTime ? defaultEnd : cue.endTime;

      return {
        content: `<div id="ad-lowerthird-${this.cid}-${cue.id}" class="video__lowerthird-overlay" />`,
        align: "bottom",
        start: cue.startTime,
        end,
      };
    });

    overlays.push({
      content: "<div class=\"video__ad-overlay\">Advertisement</div>",
      align: "top-left",
      start: "ads-ad-started",
      end: "playing",
    });

    this.player.overlay({
      content: "",
      overlays,
      showBackground: false,
      attachToControlBar: true,
      debug: false,
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

  // isVideoLoaded(videoId) {
  //   return this.player && this.player.mediainfo && this.player.mediainfo.id === videoId;
  // }

  loadVideo(videoId) {
    if (!this.player) {
      return Promise.resolve(false);
    }

    // this.videoId = videoId;

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
   *
   * This is run when the player is initially setup so consider resizing
   * this.videoEl before making the player visible.
   */
  // setInitialDimensions() {
  //   if (!this.player) {
  //     return;
  //   }

  //   let width = 1280;
  //   let height = width / this.defaultAspectRatio;

  //   this.player.dimensions(width, height);
  // }

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

    let data = {
      "@context": "http://schema.org",
      "@type": "VideoObject",
      "name": this.getVideoProperty("name") || defaultDescription,
      "description": this.getVideoProperty("description") || defaultDescription,
      "thumbnailURL": this.getVideoProperty("poster"),
      "embedURL": "https://players.brightcove.net/5104226627001/default_default/index.html?videoId=" + videoId,
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
