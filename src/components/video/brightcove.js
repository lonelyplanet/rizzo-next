/* global videojs */

import VideoPlayer from "./video_player";

class Brightcove extends VideoPlayer {

  initialize(options) {
    // Cache of any video metadata we come across.
    this.videoMediaInfo = {};

    // Reference to a video.js player instance
    this.player = null;

    this.accountId = "5104226627001";
    this.bcPlayerId = "default";
    this.bcPlayer360Id = "HkUmgIl6";
    this.policyKey = "BCpkADawqM215uOvhQWwjkTCXEb4uomDGwVmCx_TrCq3pmoyRSl7ISWkWgkFPG_-QZC8k55V_cP8wvTsivQa6jEgXkdnr_OTJzArFIuIxmmdFdrx2d4jgOH959-2_zXeC455OeqA8jr-h40g"; 
  
    super.initialize(options);
    this.events["click .video-js"] = "onClickVideo";
  }

  /**
   * Returns 'undefined' if unable to find a .video-js element
   */
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
    if (!this.videoEl) {
      this.trigger("ready");
      return;
    }

    this.setPlayer().then(() => {
      this.trigger("ready");
    });
  }

  setPlayer() {
    if (this.player) {
      // In our current implementation, we only 
      // allow a player to be instantiated once.
      return new Promise.resolve();
    }

    return new Promise((resolve) => {
      let self = this;
      videojs(this.videoEl).ready(function () {
        self.player = this;
        self.player.on("ended", () => { self.trigger("ended"); });
        self.setInitialDimensions();
        resolve();
      });
    });
  }

  search() {
    return new Promise((resolve) => {
      try {
        let refId = "dest_" + window.lp.place.atlasId;
        let url = "https://edge.api.brightcove.com/playback/v1/accounts/" + this.accountId + "/videos/ref:" + refId;
        let accept = "application/json;pk=" + this.policyKey;

        $.ajax({
          url: url,
          context: this,
          headers: {
            "Accept": accept
          },
          success: function (data) {
            this.videoMediaInfo[data.id] = data;
            resolve([data]);
          },
          error: function () {
            resolve([]);
          }
        });

      }
      catch (e) {
        resolve([]);
      }
    });
  }

  searchAndLoadVideo() {
    return this.search().then((videos) => {
      if (videos.length) {
        let videoId = videos[0].id;
        return this.loadVideo(videoId);
      }
      return new Promise.resolve(false);
    });
  }

  insertPlayer(el, videoId) {
    return new Promise((resolve) => {
      let playerId = this.is360Video(videoId) ? this.bcPlayer360Id : this.bcPlayerId;

      // let html = "<video data-video-id=\"" + videoId + "\" data-account=\"" + this.accountId + "\" data-player=\"" + playerId + "\" data-embed=\"default\" class=\"video-js\" controls></video>";
      let html = "<video data-account=\"" + this.accountId + "\" data-player=\"" + playerId + "\" data-embed=\"default\" class=\"video-js\" controls></video>";
      
      el.innerHTML = html;

      let s = document.createElement("script");
      s.src = "//players.brightcove.net/" + this.accountId + "/" + playerId + "_default/index.min.js";
      
      s.onload = () => {
        this.setPlayer().then(() => {
          this.renderSEOMarkup();
          resolve();
        });
      };

      document.body.appendChild(s);
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
          let mediainfo = this.player.mediainfo;
          this.videoMediaInfo[mediainfo.id] = mediainfo;
          this.renderSEOMarkup();
        }
        resolve(!error);
      });
    });
  }

  /**
   * Determines whether the currently loaded video is a 360 video.
   *
   * We use tagging in brightcove since this data is not included in 
   * the standard video metadata.
   * We use the tag '360' to tell our code that a video is a 360 video.
   */
  is360Video(videoId) {
    let mediainfo = null;

    if (videoId) {
      mediainfo = this.videoMediaInfo[videoId];
    }
    else if (this.player) {
      mediainfo = this.player.mediainfo;
    }

    if (!mediainfo) {
      return false;
    }

    let tags = mediainfo.tags;
    for (let i = 0; i < tags.length; i++) {
      let tag = tags[i];
      if (tag == "360") {
        return true;
      }
    }

    return false;
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
  setInitialDimensions() {
    if (!this.player) {
      return;
    }

    let width = 1280;
    let height = width / this.defaultAspectRatio;

    this.player.dimensions(width, height);
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
   * Retrieves SEO-friendly metadata about the highest-resolution "source" 
   * of the currently loaded video
   *
   * @returns {Object} object with 'url', 'width', and 'height' 
   *   attributes, null if unable to retrieve valid metadata
   */
  getVideoSourceData () {

    if (!this.player || !this.player.mediainfo) {
      return null;
    }

    // Schema.org VideoObject valid types include:
    //   .mpg, .mpeg, .mp4, .m4v, .mov, .wmv, .asf, .avi, .ra, .ram, .rm, .flv
    //   (Some of these are skipped here because they pertain to audio-only file types)
    //   https://developers.google.com/webmasters/videosearch/schema
    let validTypes = [
      "video/mpeg",
      "video/mp4",
      "video/x-m4v",
      "video/quicktime",
      "video/x-ms-wmv",
      "video/x-ms-asf",
      "video/x-msvideo",
      "application/vnd.rn-realmedia",
      "video/x-flv"
    ];

    let url = null;
    let width = 0;
    let height = 0;

    $.each(this.player.mediainfo.sources, function (i, source) {
      if (!source.type || validTypes.indexOf(source.type.toLowerCase()) == -1) {
        return;
      }

      if (!url || (width < source.width)) {
        url = source.src;
        width = source.width;
        height = source.height;
      }
    });

    return url ? { url: url, width: width, height: height } : null;
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

    let src = this.getVideoSourceData();
    if (!src) {
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

    let embedUrl = "http://players.brightcove.net/5104226627001/default_default/index.html?videoId=" + videoId;

    let data = {
      "@context": "http://schema.org",
      "@type": "VideoObject",
      "name": this.getVideoProperty("name") || defaultDescription,
      "description": this.getVideoProperty("description") || defaultDescription,
      "thumbnailURL": this.getVideoProperty("thumbnail"),
      "contentURL": src.url,
      "embedURL": embedUrl,
      "duration": duration,
      "uploadDate": this.getVideoProperty("createdAt"),

      // Leaving width and height off because they are optional and the width and height returned from
      // this.getVideoSourceData() isn't necessarily the largest dimensions the video can be rendered at.
      // All source data in brightcove's video metadata uses the same value for "contentURL" above, so 
      // Google, Bing, etc. should be able to determine the resolution of the video on their own.
      // "height": src.height,
      // "width": src.width,
    };

    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(data);
    document.getElementsByTagName("head")[0].appendChild(script);
  }

}

export default Brightcove;
