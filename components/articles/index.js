import { Component } from "../../core/bane";
import $clamp from "clamp-js/clamp.js";

require("./_articles.scss");

class ArticlesComponent extends Component {
  initialize(options) {
    this.articles = this.$el.find(".article");
    this.maxLines = options.maxLines || 6;
    this.titleLineHeight = options.titleLineHeight || { desktop: 35, mobile: 23 };
    this.blurbLineHeight = options.blurbLineHeight || { desktop: 27, mobile: 18 };
    this.mobileWidth = options.mobileWidth || 717;
    this.screen = "mobile";

    if (!$("html").hasClass("ie9")) {
      this._detectScreen();
      this._clampText();

      $(window).on("resize", () => {
        this._detectScreen();
        this._clampText();
      });
    }
  }
  _detectScreen() {
    this.screen = $(window).width() >= this.mobileWidth ? "desktop" : "mobile";
  }
  _clampText() {
    this.articles.each((index, article) => {
      let articleElems = this._findElements(article);

      // This means we'll probably be removing from both the teaser and the blurb
      if (articleElems.removeLines > 1) {
        // Teaser is clamped to 3 unless the title is 2 lines
        // Blurb should always be 2 lines, unless...
        let teaserClamp = articleElems.titleLines > 1 ? 2 : 3,
            blurbClamp = 2;

        // ...it doesn't have 2 lines. In which case, give one back to the teaser
        if (articleElems.blurbLines < blurbClamp) {
          teaserClamp++;
        }

        $clamp(articleElems.teaser, { clamp: teaserClamp });
        $clamp(articleElems.blurb, { clamp: blurbClamp });
      } else if (articleElems.removeLines && articleElems.removeLines >= 1) {
        // If just removing from one section, figure out which one is bigger and remove from that
        let removeFrom, removeLines;

        if (articleElems.teaserLines > articleElems.blurbLines) {
          removeFrom = { section: articleElems.teaser, lines: articleElems.teaserLines };
        } else {
          removeFrom = { section: articleElems.blurb, lines: articleElems.blurbLines };
        }

        removeLines = removeFrom.lines - articleElems.removeLines;

        $clamp(removeFrom.section, { clamp: removeLines });
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
        titleHeight = parseInt(title.height()),
        teaserHeight = parseInt(teaser.height()),
        blurbHeight = parseInt(blurb.height()),

        // Figure out how many lines each element actually is based on line heights and height
        blurbLines  = blurbHeight / this.blurbLineHeight[this.screen],
        teaserLines = teaserHeight / this.blurbLineHeight[this.screen],
        titleLines = titleHeight / this.titleLineHeight[this.screen],

        // Figure out how many lines need to be removed
        linesAllowed = this.maxLines - titleLines,
        removeLines = blurbLines + teaserLines - linesAllowed;

    return {
      removeLines: removeLines,
      titleLines: titleLines,
      blurbLines: blurbLines,
      teaser: teaser[0],
      blurb: blurb[0]
    };
  }
}

export default ArticlesComponent;
