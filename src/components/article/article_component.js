import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/function/debounce";
import ArticleBodyComponent from "../article_body";

// 1. Set hasLoaded = false
// 2. When ajax call is success, set hasLoaded to true
// 3. Reset windowScrollTop; add height of previous article and pagination to windowScrollTop
// 4. Repeat
//
// Should articles be added to an array? (We can use each index to get new offset top.)
//
// Need an "up scroll" method to go "back" and change HTML5 pushState with previous article slug
// - get bottom of article position, check window scroll, change URL
//
// Need to make sure photos load and photo gallery works for each new article

export default class ArticleComponent extends Component {
  initialize() {
    this.$window = $(window);

    // this.articleBodyComponent = new ArticleBodyComponent();

    this.articleHeight;
    this.articlePaginationHeight;
    this.footerHeight;

    this.scrollOffset = 500;
    this.windowScrollTop = this.$window.scrollTop();
    this.articleScrollTop;

    this.template = require("./article.hbs");

    this.hasNextArticleLoaded = false;

    this.articles = new Map();

    // setTimeout is because of webfonts and images
    // Probably need to use hasImagesLoaded and a
    // webfont loader
    setTimeout(() => {
      this.articleHeight = this.$el.height();
      this.articlePaginationHeight = this.$el.find(".article-pagination").height();
      this.footerHeight = this.$el.closest(".footer").height();
      this.scrollOffset += this.articlePaginationHeight + this.footerHeight;
      this.articleScrollTop = this.articleHeight - this.scrollOffset;
    }, 1500);

    this.$activeArticle = this.$el;
    this.$activeArticle.addClass("is-active");

    this.articles.set(this.$el[0], {
      title: this.$activeArticle.data("title"),
      slug: this.$activeArticle.data("slug")
    });

    // console.log(this.articles);

    // Check on load
    if(this.windowScrollTop >= this.articleScrollTop) {
      console.log("Load Next");
    }

    // Check on scroll
    this.$window.scroll(debounce(() => {
      this.windowScrollTop = this.$window.scrollTop();

      if(this.windowScrollTop >= this.articleScrollTop) {
        console.log("Load Next");
        this._getNextArticle();
      }

      // check scroll top against each value in the map
      this.articles.forEach((data, article) => {
        if (this.windowScrollTop) {
          let top = article.offsetTop,
              bottom = top + article.offsetHeight;

          if (this.windowScrollTop < bottom && this.windowScrollTop > top) {
            this.$activeArticle = $(article).addClass("is-active");
          } else {
            $(article).removeClass("is-active");
          }
        }
      });

      if (this.$activeArticle.hasClass("is-active")) {
        this._updateHistory(
          window.location.pathname,
          this.$activeArticle.data("title"),
          this.$activeArticle.data("slug")
        );
      }

      // console.log(this.windowScrollTop, this.articleScrollTop);
    }, 100));
  }

  _loadFirstArticle() {
    //
  }

  _getNextArticle() {
    let slug = `/${this.$activeArticle.data("nextSlug")}`;

    $.ajax(slug, {
      success: (data) => {
        this.hasNextArticleLoaded = true;

        // console.log("success", this.hasNextArticleLoaded);

        // Add data to template and append to page
        let $newArticle = $(this.template(data)).appendTo(".page-container");
        $newArticle.addClass("is-active");
        $newArticle.data("nextSlug", data.article.related_articles[0].slug);
        this.articles.set($newArticle[0], data.article); // Array

        // console.log(this.articles);

        this._updateHistory(window.location.pathname, data.article.title, data.article.slug);

        this._reset();

        // let articleBodyComponent = new ArticleBodyComponent({el: this.$activeArticle});
        // console.log(articleBodyComponent);
        // console.log(articleBodyComponent.initialize());
        new ArticleBodyComponent({el: $newArticle});
      },
      error: () => {
        this.hasNextArticleLoaded = false;
        // console.log("error", this.hasNextArticleLoaded);
      }
   });
  }

  _reset() {
    // This will be called after a new article loads in
    // It will reset windowScrollTop to the offset top of
    // the new article
    this.hasNextArticleLoaded = false;
    this.windowScrollTop = this.$window.scrollTop();
    this.articleScrollTop = this.windowScrollTop + this.articleHeight - this.scrollOffset;

    // console.log("reset", this.hasNextArticleLoaded);
    // console.log(this.windowScrollTop, this.articleScrollTop);
  }

  _updateHistory(pathname, title, slug) {
    // @TODO Use modernizr to check support
    if (pathname !== `/${slug}`) {
      history.pushState(null, title, `/${slug}`);
      console.log(`History updated: ${slug}`);
    }
  }
}
