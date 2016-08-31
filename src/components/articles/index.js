import { Component } from "../../core/bane";
import $clamp from "clamp-js/clamp.js";
import $ from "jquery";

import "./_articles.scss";

class ArticlesComponent extends Component {
  initialize(options) {
    this.articles = this.$el.find(".article");
    this.maxLines = options.maxLines || 6;
    // Retrieved via getComputedStyle($0)["line-height"] ish
    this.titleLineHeight = options.titleLineHeight || { desktop: 35, mobile: 23 };
    this.blurbLineHeight = options.blurbLineHeight || { desktop: 27, mobile: 18 };
    this.mobileWidth = options.mobileWidth || 717;
    this.screen = "mobile";

    if (!$("html").hasClass("ie9")) {
      this._detectScreen();
      this._clampText();

      $(window).on("resize", this._reclamp.bind(this));
    }

  }
  widthWindow() {
    return $(window).width();
  }
  isDesktop() {
    return this.widthWindow() >= this.mobileWidth;
  }
  _reclamp() {
    this._detectScreen();
    this._clampText();
  }
  _detectScreen() {
    return this.screen = this.isDesktop() ? "desktop" : "mobile";
  }
  _clampText() {
    this.articles.each((index, article) => {
      let {
        titleLines,
        teaserLines,
        teaser,
        blurb
      } = this._findElements(article);

      // aka 2 + 5 or something
      try {
        if (titleLines + teaserLines > this.maxLines) {
          let teaserClamp = Math.ceil(this.maxLines - titleLines);
          $clamp(teaser.get(0), { clamp: teaserClamp });
          teaser.addClass("article__info__teaser--small");
          blurb.prop("hidden", true);
        } else {
          // Only clamp the blurb
          let blurbClamp = Math.ceil(this.maxLines - titleLines - teaserLines);
          $clamp(blurb.get(0), { clamp: blurbClamp });
        }
      } catch(e) {
        // Clamp broke... oh well
      }
    });
  }
  _findElements(article) {
    // Select all necessary elements
    let $article = $(article),
        title = $article.find(".article__info__title"),
        teaser = $article.find(".article__info__teaser"),
        blurb = $article.find(".article__info__blurb"),
        // Find elements heights
        titleHeight = parseInt(title.height(), 10) || 0,
        teaserHeight = parseInt(teaser.height(), 10) || 0,
        blurbHeight = parseInt(blurb.height(), 10) || 0,
        // Figure out how many lines each element actually is based on line heights and height
        blurbLines = blurbHeight / this.blurbLineHeight[this.screen],
        teaserLines = teaserHeight / this.blurbLineHeight[this.screen],
        titleLines = titleHeight / this.titleLineHeight[this.screen],

        // Figure out how many lines need to be removed
        linesAllowed = this.maxLines - titleLines,
        removeLines = Math.floor(blurbLines + teaserLines - linesAllowed);

    return {
      removeLines: removeLines,
      titleLines: titleLines,
      teaserLines: teaserLines,
      blurbLines: blurbLines,
      teaser: teaser,
      blurb: blurb
    };
  }
}

export default ArticlesComponent;
