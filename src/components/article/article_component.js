import { Component } from "../../core/bane";
import $ from "jquery";
import ArticleBodyComponent from "../article_body";
import SocialShareComponent from "../social_share";
import ArticleModel from "./article_model";
import subscribe from "../../core/decorators/subscribe";

const adpackage = document.cookie.match(/adpackage/);

export default class ArticleComponent extends Component {
  initialize() {
    this.subscribe();

    this.adLeaderboardTemplate = require("../ads/ad_article_leaderboard.hbs");

    this._setFirstArticle();
  }

  _insertInlineAdSlots($article) {
    const $articleBody = $article.find(".js-article-body");
    const interval = 6;
    const adSlot = (adNumber) => `<div class="adunit--articles-inline" id="ad-articles-in-article-${adNumber}" />`;

    const paragraphs = $articleBody.find("p")
      .filter((index, p) => {
        return !$(p).attr("class") || $(p).attr("class") === "feature" ;
      });

    $(paragraphs).each((index, p) => {
      const notFirst = index !== 0;
      const atEachInterval = (index + 1) % interval === 0;
      const adCount = (index + 1) / interval;

      if (notFirst && atEachInterval) {
        $(p).after(adSlot(adCount));
      }
    });
  }

  @subscribe("ad.loaded", "ads")
  _adsLoaded(data) {
    if (data.size === "leaderboard-responsive") {
      if (!this.hasAdTimeoutResolved) {
        clearTimeout(this.adTimer);
        this.adLoadedPromise && this.adLoadedPromise();
      }
    }
  }

  /**
   * Set the first article
   */
  _setFirstArticle() {
    this.socialShareComponent = new SocialShareComponent({
      el: this.$el.find(".js-action-sheet")
    });

    let firstArticle = new ArticleModel({
      url: `${window.location.pathname}.json`
    });

    firstArticle.set(window.lp.article_raw);

    this._setInitialCallouts(firstArticle.get("content").callouts);

    // Put the ad in the first article, but don't load it yet
    this.$el.append(this.adLeaderboardTemplate({ adpackage }));

    if (adpackage) {
      this._insertInlineAdSlots(this.$el);
    }
  }

  _setInitialCallouts(callouts) {
    this.articleBody = new ArticleBodyComponent({
      el: this.$el.find(".js-article-body"),
      poiData: callouts
    });
  }
}
