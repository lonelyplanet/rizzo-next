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

    // Policy key reference: https://docs.brightcove.com/en/video-cloud/player-management/guides/policy-key.html
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

  /**
   * Instantiates a videojs instance from
   * the existing Brightcove embed markup on the page.
   *
   * If the Brightcove embed doesn't exist on the page, make sure to run 
   * insertPlayer prior to running this method.
   */
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
        resolve();
      });
    });
  }

  /**
   * Searches for any videos associated with the current page
   * and returns a list of each matching videos' metadata.
   */
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

  /**
   * Convenience method to find a video and load it into
   * the instantiated videojs instance / player.
   */
  searchAndLoadVideo() {
    return this.search().then((videos) => {
      if (videos.length) {
        let videoId = videos[0].id;
        return this.loadVideo(videoId);
      }
      return new Promise.resolve(false);
    });
  }

  /**
   * Inserts a Brightcove player embed into the DOM
   * and instantiates the player / videojs instance.
   *
   * @param {Object} el - DOM element to insert the player into
   * @param {number} videoId - The id of the video that will be eventually 
   *    loaded into the player; This is used to determine which player 
   *    needs to be inserted.
   */
  insertPlayer(el, videoId) {
    if (this.videoEl) {
      // A player has already been inserted before
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let playerId = this.is360Video(videoId) ? this.bcPlayer360Id : this.bcPlayerId;

      let html = "<video data-account=\"" + this.accountId + "\" data-player=\"" + playerId + "\" data-embed=\"default\" class=\"video-js\" controls></video>";
      
      el.innerHTML = html;

      let s = document.createElement("script");
      s.src = "//players.brightcove.net/" + this.accountId + "/" + playerId + "_default/index.min.js";
      
      s.onload = () => {
        this.setPlayer().then(() => {
          resolve();
        });
      };

      document.body.appendChild(s);
    });
  }

  /**
   * Loads a video into the instantiated videojs instance
   *
   * @param {number} videoId - The id of the video to load in the player
   */
  loadVideo(videoId) {
    if (!this.player) {
      // We don't have a player to load the video into
      return Promise.resolve(false);
    }

    let video = this.videoMediaInfo[videoId];
    if (video) {
      // We already have a video and the player, so just load it
      this.player.catalog.load(video);
      this.renderSEOMarkup();
      return Promise.resolve(true);
    }
    else {
      // We don't have the video data yet, so fetch it and then
      // load it into the player.
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
  }

  /**
   * Determines whether the currently loaded video is a 360 video.
   *
   * We use tagging in brightcove since this data is not included in 
   * the standard video metadata.
   *
   * We use the tag '360' to tell our code that a video is a 360 video.
   *
   * @param {number} videoId - The id of the video to check
   * @return {Boolean} whether the specified video is a 360 video or not.
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
   * Retrieves the url for the highest-resolution SEO-friendly video source 
   * of the currently loaded video
   *
   * @returns {string} url, null if unable to retrieve an SEO-friendly url
   */
  getVideoSourceURL () {

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

    $.each(this.player.mediainfo.sources, function (i, source) {
      if (!source.type || validTypes.indexOf(source.type.toLowerCase()) == -1) {
        return;
      }

      if (!url || (source.width && width < source.width)) {
        url = source.src;
        width = source.width;
      }
    });

    return url;
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

    let playerId = this.is360Video(videoId) ? this.bcPlayer360Id : this.bcPlayerId;
    let embedUrl = "http://players.brightcove.net/" + this.accountId + "/" + playerId + "_default/index.html?videoId=" + videoId;

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

    // This is not a required field since we will always already
    // have an "embedURL" value in the SEO data, but it doesn't 
    // hurt to be thorough if we have the data available.
    let contentURL = this.getVideoSourceURL();
    if (contentURL) {
      data["contentURL"] = contentURL;
    }

    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(data);
    document.getElementsByTagName("head")[0].appendChild(script);
  }

}

export default Brightcove;
