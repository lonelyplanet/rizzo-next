import { Component } from "../../core/bane";
import Slideshow from "../slideshow";
import assign from "lodash/object/assign";
import "./masthead_nav.js";
import coverVid from "../../core/utils/covervid";
import MobilUtil from "../../core/mobile_util";
import fitText from "../../core/utils/fitText";
import subscribe from "../../core/decorators/subscribe";
import Video from "../video";

/**
 * Masthead Component
*/
export default class MastheadComponent extends Component {
  get $straplines() {
    return this.$el.find(".masthead__strapline");
  }

  initialize(options) {
    this.events = {
      "click .js-play-video": "playVideo"
    };

    $.each(this.$straplines, function(index, strapline) {
      if (!$(strapline).html()) {
        $(strapline)
          .parent()
          .addClass("has-empty");
      }
    });

    this.$video = this.$el.find(".js-video").on("playing", (event) => {
      $(event.target).addClass("is-playing");
    });

    if (this.$video.length && !MobilUtil.isMobile()) {
      this.$el.find(".slideshow").remove();
      coverVid(this.$video[0], 1440, 680);
      return;
    } else if (this.$video.length && MobilUtil.isMobile()) {
      this.$video.closest(".js-video-container").remove();
    }

    this.slideshow = new Slideshow(assign({
      el: this.$el.find(".slideshow")
    }, options.slideshow));

    this.listenTo(this.slideshow, "image.changed", this.updateStrapline);

    fitText(this.$el.find(".js-masthead-title"), {
      fontSizes: [ 56, 60, 80, 120 ],
      minFontSize: 56
    });

    // Initialize video overlay
    Video
      .addPlayer("#video-overlay", "brightcove")
      .then(this.playerReady.bind(this));

    this.subscribe();
  }

  @subscribe("ad.loaded", "ads");
  mastheadAdLoaded(data) {
    if (data.id === "sponsor-logo-masthead" || data.id === "best-in-badge-masthead") {
      let $mastheadAd = this.$el.find("#" + data.id);

      if ($mastheadAd.hasClass("display-block")) {
        this.$el.find(".masthead__text-wrap").removeClass("masthead__text-wrap--pull-up")
          .addClass("masthead__text-wrap--pull-up");
      }
    }
  }

  /**
   * Play the video, callback from click handler
   */
  playVideo() {
    this.player.play();
  }

  /**
   * Callback from the player "ready" event
   * @param  {VideoPlayer} player Instance of the VideoPlayer
   */
  playerReady(player) {
    this.player = player;
    this.player.search().then(this.searchDone.bind(this));
  }

  /**
   * Callback from the player search()
   * @param  {videos} list of video ids that matched the search
   */
  searchDone(videos) {
    if (videos.length) {
      let videoId = videos[0];
      this.player.loadVideo(videoId).then(this.loadDone.bind(this));
    }
  }

  /**
   * Callback from the player loadVideo()
   * @param  {success} bool depicting whether the video successfully loaded or not
   */
  loadDone(success) {
    if (!success) {
      return;
    }

    this.$el.find(".js-play-video")
      .removeAttr("hidden")
      .addClass("is-visible");
  }

  updateStrapline(data) {
    this.$straplines.removeClass("masthead__strapline--visible");
    this.$straplines
      .eq(data.index)
      .addClass("masthead__strapline--visible");
  }
}
