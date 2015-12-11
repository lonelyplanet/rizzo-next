import { Component } from "../../core/bane";
import Slideshow from "../slideshow";
import assign from "lodash/object/assign";
import Overlay from "../overlay";
import "./masthead_nav.js";
import coverVid from "../../core/utils/covervid";
import MobilUtil from "../../core/mobile_util";

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

    this.overlay = new Overlay();

    $.each(this.$straplines, function(index, strapline) {
      if (!$(strapline).html()) {
        $(strapline)
          .parent()
          .addClass("has-empty");
      }
    });

     // import Video from "../video";
    this.$video = this.$el.find(".js-video").on("playing", () => {
      $(event.target).addClass("is-playing");
    });
    
    if (this.$video.length && !MobilUtil.isMobile()) {
      coverVid(this.$video[0], 1440, 680);
      return;
    } else if (this.$video.length && MobilUtil.isMobile()) {
      this.$video.closest(".js-video-container").remove();
    }
    
    this.slideshow = new Slideshow(assign({
      el: this.$el.find(".slideshow")
    }, options.slideshow));
    
    this.listenTo(this.slideshow, "image.changed", this.updateStrapline);
  }
   /**
   * Play the video, callback from click handler
   */
  playVideo() {
    this.overlay.show();
    this.player.play(this.videoId);
  }

  /**
   * Callback from the player load event
   * @param  {VideoPlayer} player Instance of the VideoPlayer
   * @listens {play}
   */
  playerReady(player) {
    this.player = player;

    this.player.search(window.lp.place.atlasId)
      .then(this.searchDone.bind(this));

    this.listenTo(this.player, "play", this.onPlay);
    this.listenTo(this.player, "stop", this.onStop);
    this.listenTo(this.player, "pause", this.onStop);
  }

  onPlay() {
    // Use this?
  }

  onStop() {
    // Use?
    this.overlay.hide();
  }

  searchDone(videos) {
    if (videos.length) {
      this.$el.find(".js-play-video")
        .removeAttr("hidden")
        .addClass("is-visible");
        
      this.videoId = videos[0];
    }
  }

  updateStrapline(data) {
    this.$straplines.removeClass("masthead__strapline--visible");
    this.$straplines
      .eq(data.index)
      .addClass("masthead__strapline--visible");
  }
}
