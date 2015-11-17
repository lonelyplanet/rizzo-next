import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/function/debounce";
import "./article.scss";

export default class ArticleComponent extends Component {
  initialize() {
    let $window = $(window);

    let articleHeight,
        articlePaginationHeight,
        footerHeight;

    let scrollOffset = 500;

    let windowScrollTop = $window.scrollTop();

    this.template = require("./article.hbs");

    console.log(this.$el.data("next-slug"));

    // setTimeout is because of webfonts and images
    // Probably need to use hasImagesLoaded and a
    // webfont loader
    setTimeout(() => {
      articleHeight = this.$el.height();
      articlePaginationHeight = this.$el.find(".article-pagination").height();
      footerHeight = this.$el.closest(".footer").height();
      scrollOffset += articlePaginationHeight + footerHeight;
    }, 1500);

    // Check on load
    if(windowScrollTop >= (articleHeight - scrollOffset)) {
      console.log("Load Next");
    }

    // Check on scroll
    $window.scroll(debounce(() => {
      windowScrollTop = $window.scrollTop();

      if(windowScrollTop >= (articleHeight - scrollOffset)) {
        console.log("Load Next");
        this.getNextArticle();
      }
    }, 100));
  }

  getNextArticle() {
    $.ajax(`/${this.$el.data("next-slug")}`, {
      success: (data) => {
        console.log(data.article);
        $(this.template(data)).appendTo(".page-container");
      },
      error: () => {
        console.log('error');
      }
   });
  }
}
