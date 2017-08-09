/* global videojs */

import VideoPlayer from "./video_player";

class Brightcove extends VideoPlayer {
  initialize(options) {
    super.initialize(options);

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
    const promise = this.player.play();

    // Catch any errors thrown within play promise (only applicable on some browsers)
    if (promise) {
      promise.catch(reason => console.log('VIDEOJS:', reason)).then(() => {});
    }
  }

  pause() {
    super.pause();
    this.autoplay = false;
    this.player.pause();
  }

  start() {
    this.currentVideoIndex = null;
    this.autoplay = true;
    this.loadNextVideo();
  }

  setup() {
    if (!this.videoId) {
      this.trigger("ready");
    }
    else if (!this.videoEl) {
      // Insert brightcove player html
      let html = "<video ";
      if (this.videoId) {
        html += "data-video-id='" + this.videoId + "' ";
      }
      html += "data-account='5104226627001' ";
      html += "data-player='default' ";
      html += "data-embed='default' ";
      html += "data-application-id ";
      html += "class='video-js' ";
      html += "></video>";
      this.el.innerHTML = html;

      // Insert script to initialize brightcove player
      const scriptId = this.getPlayerScriptId();
      const scriptSrc = "https://players.brightcove.net/5104226627001/default_default/index.min.js";
      const script = document.createElement("script");

      script.id = scriptId;
      script.src = scriptSrc;
      script.onload = this.onLoadSetupScript.bind(this);

      document.body.appendChild(script);
    } else if (!this.player) {
      this.player = videojs(this.videoEl);

      // We don't show the controls until the player is instantiated
      // or else the controls show briefly without the brightcove theme applied.
      this.player.controls(true);

      this.player.on("loadstart", this.onPlayerLoadStart.bind(this));
      this.player.on("playing", this.onPlayerPlaying.bind(this));
      this.player.on("ended", this.onPlayerEnded.bind(this));
      this.player.on("ads-ad-started", this.onAdStarted.bind(this));
      this.player.on("ads-ad-ended", this.onAdEnded.bind(this));
      this.player.ready(this.onPlayerReady.bind(this));
    }
  }

  dispose() {
    const scriptId = this.getPlayerScriptId();
    const script = document.getElementById(scriptId);

    if (script) {
      script.remove();
    }

    if (this.player) {
      this.player.dispose();
      this.player = null;
    }

    this.trigger("disposed", this);
  }

  getPlayerScriptId() {
    return "video__initialize-" + this.playerId;
  }

  onLoadSetupScript() {
    this.setup();
  }

  onPlayerReady() {
    this.currentVideoIndex = null;
    this.loadNextVideo();
    this.trigger("ready");
  }

  onPlayerCueChange() {
    const tt = this.player.textTracks()[0];
    const activeCue = tt.activeCues[0];
    if (!activeCue || activeCue.text !== "CODE") {
      return;
    }

    const cue = activeCue.originalCuePoint;

    const overlayElementId = `ad-lowerthird-${this.playerId}-${cue.id}`;
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
  }

  onPlayerLoadStart() {
    const tt = this.player.textTracks()[0];
    if (tt) {
      tt.oncuechange = this.onPlayerCueChange.bind(this);
    }

    this.renderSEOMarkup();
    this.updateDataLayer();
    this.configureOverlays();

    this.trigger("loadstart");

    if (this.autoplay) {
      this.play();
    }
  }

  onPlayerPlaying() {
    this.updateDataLayer();
    this.disableAdOverlay();
  }

  onPlayerEnded() {
    if (this.currentVideoIndex >= this.videos.length - 1) {
      this.trigger("ended");
    } else {
      this.loadNextVideo();
    }
  }

  onAdStarted() {
    this.enableAdOverlay();
  }

  onAdEnded() {
    this.disableAdOverlay();
  }

  enableAdOverlay() {
    const adOverlay = this.$el.find("#" + this.getAdOverlayId());
    adOverlay.css("display", "inline-block");
  }

  disableAdOverlay() {
    const adOverlay = this.$el.find("#" + this.getAdOverlayId());
    adOverlay.css("display", "none");
  }

  fetchVideos() {

    let query = null;
    try {
      query = "dest_" + window.lp.place.atlasId;
    }
    catch (e) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      $.ajax({
        url: "https://www.lonelyplanet.com/video/api/playlists.json?reference_id=" + query
      }).done((data, status, response) => {
        if (response.status === 200 && data && data.length) {
          this.videos = data[0].playlistitems.map(item => item.video);
        }

        if (this.videos.length) {
          this.loadNextVideo();
          resolve(true);
        }
        else {
          $.ajax({
            url: "https://www.lonelyplanet.com/video/api/video.json?reference_id=" + query
          }).done((data, status, response) => {
            if (response.status === 200 && data && data.length) {
              this.videos = data;
            }

            if (this.videos.length) {
              this.loadNextVideo();
              resolve(true);
            }
            else {
              resolve(false);
            }
          });
        }
      });
    });
  }

  loadNextVideo() {
    if (!this.videos.length) {
      return;
    }

    this.currentVideoIndex = this.currentVideoIndex === null ? 0 : this.currentVideoIndex + 1;
    this.currentVideoIndex = this.currentVideoIndex > this.videos.length - 1 ? 0 : this.currentVideoIndex;

    const video = this.videos[this.currentVideoIndex];

    if (!this.player) {
      this.videoId = video.provider_id;
      this.setup();
    }
    else if (!this.player.mediainfo || (this.player.mediainfo.id !== video.provider_id)) {
      // Do not load a video that is already loaded
      // (brightcove's engagement score metrics will break)
      this.player.catalog.getVideo(video.provider_id, (error, video) => {
        if (!error) {
          this.player.catalog.load(video);
        }
      });
    }
    else if (this.autoplay) {
      this.play();
    }
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

  getAdOverlayId() {
    return "ad-overlay-" + this.playerId;
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
    if (!this.player) {
      return;
    }

    const overlays = this.getCues().map((c) => {
      const cue = c.originalCuePoint;

      const defaultEnd = cue.startTime + 15;
      const end = defaultEnd < cue.endTime ? defaultEnd : cue.endTime;

      const cueElementId = "ad-lowerthird-" + this.playerId + "-" + cue.id;

      return {
        content: "<div id=\"" + cueElementId + "\" class=\"video__lowerthird-overlay\" />",
        align: "bottom",
        start: cue.startTime,
        end,
      };
    });

    overlays.push({
      content: "<div id=\"" + this.getAdOverlayId() + "\" class=\"video__ad-overlay\">Advertisement</div>",
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

  /**
   * Retrieves metadata from the currently loaded video
   * @param {string} name - The metadata attribute to retrieve a value for
   * @returns The metadata value, or undefined if unable to retrieve the value
   */
  getVideoProperty(name) {
    if (!this.player || !this.player.mediainfo) {
      return;
    }

    return this.player.mediainfo[name];
  }

  updateDataLayer () {
    Object.assign(window.lp.analytics.dataLayer[0], {
      brightcoveID: this.getVideoProperty("id"),
      brightcoveTitle: this.getVideoProperty("name"),
      brightcoveDescription: this.getVideoProperty("description")
    });
  }

  /**
   * Uses the currently loaded video data to build a block of
   * LD-JSON Schema.org markup and appends it to the "head" tag
   *
   * This is run automatically when any video is loaded.
   */
  renderSEOMarkup() {
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
      "thumbnailURL": this.getVideoProperty("poster"),
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
