/* global videojs */

import VideoPlayer from "./video_player";
import MobileUtil from "../../core/mobile_util";
import { get } from "lodash";

const _ = { get };

const bcPlayerIds = {
  default: "default",
  background: "BJputewob",
  bestintravel: "HkJcclwoZ",
  destination: "HkPdqeDiZ",
  test: "H1SwHfqIM",
};

class Brightcove extends VideoPlayer {
  initialize(options = {}) {

    // Playlist props
    this.videos = [];
    this.currentVideoIndex = null;

    // Brightcove props
    this.player = null;
    this.bcAccountId = "5104226627001";
    this.bcEmbedId = "default";
    this.bcPlayerId = bcPlayerIds[options.playerName];

    // Whether the player is within the viewport or not
    this.inView = this.isInView();

    // Popout props
    this.popoutEnabled = false; // overrides this.popout (ex. player won't popout if it's not current playing)
    this.isPoppedOut = false; // whether the player is poppout out currently or not
    this.popoutOutOfViewTimeoutId = null;
    this.popoutInViewTimeoutId = null;

    /*
      This is populated every time a text track's oncuechange event is fired.
      We can compare this to what it was previously to determine whether it's
      the first time seeing an active cue or not (so we can call onPlayerCuePoint).
    */
    this.activeCues = [];

    // These flags control whether certain UI elements should automatically
    // become visible while an ad or video are playing, and should be hidden otherwise.
    this.showCaptions = false;
    this.showMutedOverlay = false;

    super.initialize(options);

    this.events["click .video-js"] = "onClickVideo";

    window.addEventListener("scroll", this.onWindowScroll.bind(this));
  }

  set(options) {
    this.autoplay = _.get(options, "autoplay", this.autoplay);
    this.playWhenInView = _.get(options, "playWhenInView", this.playWhenInView);

    const videoId = _.get(options, "videoId", null);
    if (videoId) {
      this.loadVideo(videoId);
    }
  }

  get videoEl() {
    if (this.$el.hasClass("video-js")) {
      return this.el;
    }
    return this.$el.find(".video-js")[0];
  }

  onWindowScroll() {
    const inView = this.isInView();
    if (!this.inView && inView) {
      this.onInView();
    }
    else if (this.inView && !inView) {
      this.onOutOfView();
    }
    this.inView = inView;
  }

  updatePopout() {
    if (this.popoutEnabled && this.isAboveViewport()) {
      this.showPopout();
    }
    else {
      this.hidePopout();
    }
  }

  showPopout() {
    if (!this.popout || this.isPoppedOut) {
      return;
    }

    this.isPoppedOut = true;
    const popoutInner = this.$el.find(".video__popout-inner");

    clearInterval(this.popoutInViewTimeoutId);
    this.popoutInViewTimeoutId = null;
    if (!this.popoutOutOfViewTimeoutId) {
      popoutInner.removeClass("video__popout-inner-visible");
      if (this.hasLPUIPlugin()) {
        this.player.lp().props({
          popoutHandler: this.onClickPopoutOverlay.bind(this),
        });
      }
      this.popoutOutOfViewTimeoutId = setTimeout(() => {
        popoutInner.addClass("video__popout-inner-poppedout").addClass("video__popout-inner-visible");
        this.popoutOutOfViewTimeoutId = null;
      }, 200);
    }
  }

  hidePopout() {
    if (!this.popout || !this.isPoppedOut) {
      return;
    }

    this.isPoppedOut = false;
    const popoutInner = this.$el.find(".video__popout-inner");

    clearInterval(this.popoutOutOfViewTimeoutId);
    this.popoutOutOfViewTimeoutId = null;
    if (!this.popoutInViewTimeoutId) {
      popoutInner.removeClass("video__popout-inner-visible");
      if (this.hasLPUIPlugin()) {
        this.player.lp().hidePopout();
      }
      this.popoutInViewTimeoutId = setTimeout(() => {
        popoutInner.removeClass("video__popout-inner-poppedout").addClass("video__popout-inner-visible");
        this.popoutInViewTimeoutId = null;
      }, 200);
    }
  }

  hasLPUIPlugin() {
    return this.player && this.player.lp && this.player.lp() && this.player.lp().props;
  }

  onInView() {
    this.updatePopout();

    if (this.player && this.playWhenInView) {
      this.showMutedOverlay = true;
      this.showCaptions = true;
      this.player.muted(true);
      this.play();
    }
  }

  onOutOfView() {
    this.updatePopout();

    if (this.pauseWhenOutOfView) {
      this.pause();
    }
  }

  isInView() {
    return !this.isAboveViewport() && !this.isBelowViewport();
  }

  isBelowViewport() {
    const bounds = this.el.getBoundingClientRect();
    const containerHeightThreshold = bounds.height * this.outOfViewThreshold;
    const windowHeight = window.innerHeight;
    return bounds.top > (windowHeight - containerHeightThreshold);
  }

  isAboveViewport() {
    const bounds = this.el.getBoundingClientRect();
    const containerHeightThreshold = bounds.height * this.outOfViewThreshold;
    return bounds.top < -(containerHeightThreshold);
  }

  onClickVideo(event) {
    /*
      Prevent event from bubbling into the UI
      when the user interacts with the video.

      This was originally put it for our "Video Poster Button" component
      (which isn't currently used anymore and didn't use our videojs-lp plugin).

      Stopping event propagation breaks our videojs-lp plugin though, so check for it here.
    */
    if (!this.hasLPUIPlugin()) {
      event.stopPropagation();
    }
  }

  play() {
    super.play();
    this.autoplay = true;
    if (this.player) {
      const promise = this.player.play();
      if (promise) {
        promise.catch(reason => console.log("VIDEOJS:", reason)).then(() => {});
      }
    }
  }

  pause() {
    super.pause();
    this.autoplay = false;
    if (this.player) {
      this.player.pause();
    }
  }

  start() {
    this.currentVideoIndex = null;
    this.autoplay = true;
    this.loadNextVideo();
  }

  setup() {
    if (!this.videoEl) {
      let html = `
        <div class="video__popout ${MobileUtil.isMobile() ? "video__popout-mobile" : ""}">
          <div class="video__popout-inner video__popout-inner-visible ${this.cover ? "video__cover--container" : ""}">
            ${this.popout ? "<div id='" + this.getPopoutOverlayId() + "' class='video__popout-overlay icon-close-small'></div>" : ""}
            <video
              ${this.videoId ? "data-video-id='" + this.videoId + "'" : ""}
              ${this.playsInline ? "playsinline webkit-playsinline" : ""}
              data-account="${this.bcAccountId}"
              data-player="${this.bcPlayerId}"
              data-embed="${this.bcEmbedId}"
              data-application-id class="video-js" ></video>
            <div class='video__muted-overlay'><span class='vjs-icon-volume-high' /></div>
          </div>
        </div>`;

      this.el.innerHTML = html;

      // Bind hover class as we style various things under this class
      // and :hover doesn't bubble
      this.$el.find(".video__popout-inner")
      .mouseenter(function () {
        $(this).addClass("video__popout-inner-hover");
      })
      .mouseleave(function() {
        $(this).removeClass("video__popout-inner-hover");
      });

      // Bind click handler to X button for popout
      this.$el.find("#" + this.getPopoutOverlayId()).click(this.onClickPopoutOverlay.bind(this));

      // Bind click handler to muted button
      this.$el.find(".video__muted-overlay").click(this.onClickMutedOverlay.bind(this));

      // Insert script to initialize brightcove player
      const scriptId = this.getPlayerScriptId();
      const scriptSrc = `https://players.brightcove.net/${this.bcAccountId}/${this.bcPlayerId}_${this.bcEmbedId}/index.min.js`;
      const script = document.createElement("script");

      script.id = scriptId;
      script.src = scriptSrc;
      script.onload = this.onLoadSetupScript.bind(this);

      document.body.appendChild(script);
    } else if (!this.player) {
      this.player = videojs(this.videoEl);

      this.player.controls(this.controls);
      this.player.playsinline(this.playsInline);
      this.player.muted(this.muted);

      this.player.on("loadstart", this.onPlayerLoadStart.bind(this));
      this.player.on("playing", this.onPlayerPlaying.bind(this));
      this.player.on("pause", this.onPlayerPause.bind(this));
      this.player.on("ended", this.onPlayerEnded.bind(this));
      this.player.on("ads-play", this.onAdPlay.bind(this));
      this.player.on("ads-pause", this.onAdPause.bind(this));
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

    this.$el.html("");

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

    /*
      We weren't able to detect whether the videojs-lp plugin
      is loaded until now, so disable redundant UI here
    */
    if (this.hasLPUIPlugin()) {
      this.$el.find("#" + this.getPopoutOverlayId()).hide();
    }

    if (this.isInView() && this.playWhenInView) {
      this.showMutedOverlay = true;
      this.showCaptions = true;
      this.player.muted(true);
      this.play();
    }

    if (!this.isInView() && this.pauseWhenOutOfView) {
      this.pause();
    }
  }

  enableCaptions() {
    if (!this.player) {
      return;
    }

    const controls = this.player.controls();

    const enableCaptionsButton = this.$el.find(".vjs-captions-menu-item");
    if (enableCaptionsButton.length) {
      if (controls) {
        this.player.controls(false);
      }
      enableCaptionsButton.click();
      if (controls) {
        this.player.controls(true);
      }
    }
  }

  disableCaptions() {
    if (!this.player) {
      return;
    }

    const controls = this.player.controls();

    const enableCaptionsButton = this.$el.find(".vjs-captions-menu-item");

    if (enableCaptionsButton.length) {
      const disableCaptionsButton = enableCaptionsButton.prev();
      if (disableCaptionsButton.length) {
        if (controls) {
          this.player.controls(false);
        }
        disableCaptionsButton.click();
        if (controls) {
          this.player.controls(true);
        }
      }
    }
  }

  getActiveCues() {
    const activeCues = [];
    this.player.textTracks().tracks_.forEach((tt) => {
      tt.activeCues_.forEach((c) => {
        activeCues.push(c);
      });
    });
    return activeCues;
  }

  onPlayerCueChange() {
    const activeCues = this.getActiveCues();

    const cuePointCue = activeCues.find(c => c.text === "CODE" && c.originalCuePoint);
    if (cuePointCue) {
      const cue = cuePointCue.originalCuePoint;
      const cueAlreadyExisted = this.activeCues.find(c => c.originalCuePoint && c.originalCuePoint.id === cue.id);
      if (!cueAlreadyExisted) {
        this.onPlayerCuePoint(cue);
      }
    }

    this.activeCues = activeCues;
  }

  onPlayerCuePoint(cue) {
    const overlayElementId = `ad-lowerthird-${this.playerId}-${cue.id}`;

    const element = document.getElementById(overlayElementId);
    if (!element) {
      return;
    }

    const cueIndex = this.player.mediainfo.cuePoints.findIndex(c => c.id === cue.id);
    if (cueIndex === -1) {
      return;
    }

    window.lp.analytics.dfp.video.lowerThird(cueIndex + 1, overlayElementId);
  }

  onPlayerLoadStart() {
    if (!this.hasLPUIPlugin()) {
      // We don't listen to oncuechange events if videojs-lp is registered
      // as it will take care of any cue-based logic we want.
      this.player.textTracks().tracks_.forEach((tt) => {
        tt.oncuechange = this.onPlayerCueChange.bind(this);
      });
    }

    this.renderPixel();
    this.renderSEOMarkup();
    this.updateDataLayer();
    this.configureOverlays();

    this.trigger("loadstart");

    if (this.autoplay) {
      this.play();
    }
  }

  onPlayerPlaying() {
    if (this.showCaptions) {
      this.enableCaptions();
    }

    if (this.showMutedOverlay) {
      this.enableMutedOverlay();
    }

    this.updateDataLayer();
    this.disableAdOverlay();
    this.popoutEnabled = true;
    this.updatePopout();
    this.$el.removeClass("video__adplaying");
    this.trigger("started");
  }

  onPlayerPause() {
    if (this.isInView()) {
      this.popoutEnabled = false;
      this.updatePopout();
    }
  }

  onPlayerEnded() {
    this.disableMutedOverlay();

    if (this.currentVideoIndex >= this.videos.length - 1) {
      this.trigger("ended");
    } else {
      this.loadNextVideo();
    }
  }

  onAdPlay() {
    this.popoutEnabled = true;
    this.updatePopout();
    this.$el.addClass("video__adplaying");
  }

  onAdPause() {
    if (this.isInView()) {
      this.popoutEnabled = false;
      this.updatePopout();
    }
    this.$el.removeClass("video__adplaying");
  }

  onAdStarted() {
    if (this.showCaptions) {
      this.enableCaptions();
    }

    /*
      Ads aren't programmatically unmutable in most cases
      so don't cover the ad and don't make the user think
      they can unmute it using our overlay.
    */
    this.disableMutedOverlay();

    this.enableAdOverlay();
    this.popoutEnabled = true;
    this.updatePopout();
    this.$el.addClass("video__adplaying");
    this.trigger("started");
  }

  onAdEnded() {
    this.disableAdOverlay();
    this.$el.removeClass("video__adplaying");
  }

  onClickPopoutOverlay() {
    this.pause();
    this.popoutEnabled = false;
    this.updatePopout();
  }

  onClickMutedOverlay() {
    if (!this.player) {
      return;
    }
    this.showCaptions = false;
    this.showMutedOverlay = false;
    this.player.muted(false);
    this.disableCaptions();
    this.disableMutedOverlay();
  }

  enableAdOverlay() {
    const adOverlay = this.$el.find("#" + this.getAdOverlayId());
    adOverlay.css("display", "inline-block");
  }

  disableAdOverlay() {
    const adOverlay = this.$el.find("#" + this.getAdOverlayId());
    adOverlay.css("display", "none");
  }

  enableMutedOverlay() {
    if (!this.player || MobileUtil.isMobile()) {
      return;
    }

    if (this.hasLPUIPlugin()) {
      this.player.lp().props({
        mutedOverlayHandler: () => {
          this.showCaptions = false;
          this.showMutedOverlay = false;
          this.player.lp().props({ mutedOverlayHandler: null });
        }
      });
    } else {
      const mutedOverlay = this.$el.find(".video__muted-overlay");
      mutedOverlay.css({ display: "flex" });
      this.player.controls(false);
      this.$el.find("#" + this.getPopoutOverlayId()).hide();
    }
  }

  disableMutedOverlay() {
    if (!this.player || this.hasLPUIPlugin()) {
      return;
    }
    const mutedOverlay = this.$el.find(".video__muted-overlay");
    mutedOverlay.hide();
    this.player.controls(true);
    this.$el.find("#" + this.getPopoutOverlayId()).show();
  }

  fetchVideos(referenceId) {
    if (!referenceId) {
      try {
        referenceId = "dest_" + window.lp.place.atlasId;
      }
      catch (e) {
        return Promise.resolve(false);
      }
    }

    const apiURL = "https://www.lonelyplanet.com/video/api/";

    return new Promise((resolve) => {
      $.ajax({
        url: `${apiURL}playlists.json?reference_id=${referenceId}`
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
            url: `${apiURL}video.json?reference_id=${referenceId}`
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

  loadVideo(videoId) {
    if (!this.player) {
      this.videoId = videoId;
      this.setup();
    }
    else if (!this.player.mediainfo || (this.player.mediainfo.id !== videoId)) {
      // Do not load a video that is already loaded
      // (brightcove's engagement score metrics will break)
      this.player.catalog.getVideo(videoId, (error, video) => {
        if (!error) {
          this.player.catalog.load(video);
        }
      });
    }
    else if (this.autoplay) {
      this.play();
    }
  }

  loadNextVideo() {
    if (!this.videos.length) {
      return;
    }

    this.currentVideoIndex = this.currentVideoIndex === null ? 0 : this.currentVideoIndex + 1;
    this.currentVideoIndex = this.currentVideoIndex > this.videos.length - 1 ? 0 : this.currentVideoIndex;

    const video = this.videos[this.currentVideoIndex];

    this.loadVideo(video.provider_id);
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

  getPopoutOverlayId() {
    return "popout-overlay-" + this.playerId;
  }

  configureOverlays() {
    if (!this.player || !this.player.overlay || this.hasLPUIPlugin()) {
      // We can't configure the overlays if there is no player or not overlays plugin registered.
      // Don't configure overlays if the videojs-lp-ui plugin is registered as it takes care of the overlys for us.
      return;
    }

    const overlayCuePoints = this.player.mediainfo.cuePoints
      .filter((cuePoint) => cuePoint.type === "CODE")
      .filter((cuePoint) => cuePoint.name !== "preview start" && cuePoint.name !== "preview end");

    const overlays = overlayCuePoints.map((cuePoint) => {
      const defaultEnd = cuePoint.startTime + 15;
      const end = defaultEnd < cuePoint.endTime ? defaultEnd : cuePoint.endTime;

      const cueElementId = `ad-lowerthird-${this.playerId}-${cuePoint.id}`;

      return {
        content: `<div id="${cueElementId}" class="video__lowerthird-overlay" />`,
        align: "bottom",
        start: cuePoint.startTime,
        end,
      };
    });

    overlays.push({
      content: `<div id="${this.getAdOverlayId()}" class="video__ad-overlay">Advertisement</div>`,
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

  renderPixel() {
    const customFields = this.getVideoProperty("customFields");

    if (this.insertPixel && customFields && customFields.pixel) {
      const pixel = customFields.pixel.replace("[timestamp]", (new Date()).getTime());
      this.$el.after(pixel);
    }
  }

  /**
   * Uses the currently loaded video data to build a block of
   * LD-JSON Schema.org markup and appends it to the "head" tag
   *
   * This is run automatically when any video is loaded.
   */
  renderSEOMarkup() {
    if (!this.seo || !this.player || !this.player.mediainfo) {
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
    let duration = `PT${seconds}S`;

    let embedUrl = `https://players.brightcove.net/${this.bcAccountId}/default_${this.bcEmbedId}/index.html?videoId=${videoId}`;

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
