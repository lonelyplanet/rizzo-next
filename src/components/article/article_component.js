import { Component } from "../../core/bane";
import $ from "jquery";
import ArticleBodyComponent from "../article_body";
import SocialShareComponent from "../social_share";
import ArticleModel from "./article_model";

export default class ArticleComponent extends Component {
  initialize() {
    this._setArticle();
  }

  _insertInlineAdSlots($article) {
    const $articleBody = $article.find(".js-article-body");
    const interval = 6;
    const adSlot = (adNumber) => `
      <div class="ad ad--inline ad--article">
        <div class="ad--inline__container">
          <div class="adunit--articles-inline" id="ad-articles-in-article-${adNumber}" />
        </div>
      </div>
    `;

    const paragraphs = $articleBody.find("p")
      .filter((index, p) => {
        return (!$(p).attr("class") || $(p).attr("class") === "feature") && !$(p).has(".copy--body__strong").length;
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

  _setArticle() {
    this.socialShareComponent = new SocialShareComponent({
      el: this.$el.find(".js-action-sheet")
    });

    let article = new ArticleModel({
      url: `${window.location.pathname}.json`
    });

    const rawArticle = window.lp.article_raw;

    article.set(rawArticle);

    this.$el.attr("id", this._createIdForArticle(rawArticle.slug));

    this._setPoiCallouts(article.get("content").callouts);

    this._insertInlineAdSlots(this.$el);
  }

  _createIdForArticle(slug) {
    return slug.split("/")[slug.split("/").length - 1];
  }

  _setPoiCallouts(callouts) {
    this.articleBody = new ArticleBodyComponent({
      el: this.$el.find(".js-article-body"),
      poiData: callouts
    });
  }
}
