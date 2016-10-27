import { Component } from "../../core/bane";
import Slideshow from "../slideshow";
import assign from "lodash/object/assign";
// import Overlay from "../overlay";
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

    // this.overlay = new Overlay();

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

    Video
      .addPlayer("#masthead-video-overlay", "brightcove_default")
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
    // this.overlay.show();
    this.player.play();
  }

  /**
   * Callback from the player load event
   * @param  {VideoPlayer} player Instance of the VideoPlayer
   * @listens {play}
   */
  playerReady(player) {
    this.player = player;

    // this.player.search(window.lp.place.atlasId)
    //   .then(this.searchDone.bind(this));
    this.player.search().then(this.searchDone.bind(this));

    // this.overlay.show();

    // this.listenTo(this.player, "play", this.onPlay);
    // this.listenTo(this.player, "stop", this.onStop);
    // this.listenTo(this.player, "pause", this.onStop);
  }

  // onPlay() {
  //   // Use this?
  // }

  // onStop() {
  //   // Use?
  //   // this.overlay.hide();
  // }

  searchDone(videos) {
    if (videos.length) {
      // this.$el.find(".js-play-video")
      //   .removeAttr("hidden")
      //   .addClass("is-visible");

      let videoId = videos[0];
      this.player.loadVideo(videoId).then(this.loadDone.bind(this));
    }
  }

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
