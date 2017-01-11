import { Component } from "../../core/bane";
import Slideshow from "../slideshow";
import assign from "lodash/assign";
import "./masthead_nav.js";
import coverVid from "../../core/utils/covervid";
import MobilUtil from "../../core/mobile_util";
import fitText from "../../core/utils/fitText";
import subscribe from "../../core/decorators/subscribe";

/**
 * Masthead Component
*/
export default class MastheadComponent extends Component {
  get $straplines() {
    return this.$el.find(".masthead__strapline");
  }

  initialize(options) {

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

    let mastheadTitle = this.$el.find(".js-masthead-title");
    if (mastheadTitle.length) {
      fitText(mastheadTitle, {
        fontSizes: [ 56, 60, 80, 120 ],
        minFontSize: 56
      });
    }

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

  updateStrapline(data) {
    this.$straplines.removeClass("masthead__strapline--visible");
    this.$straplines
      .eq(data.index)
      .addClass("masthead__strapline--visible");
  }
}
