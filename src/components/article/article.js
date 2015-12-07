import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/function/debounce";
import ArticleBodyComponent from "../article_body";

export default class ArticleComponent extends Component {
  initialize() {
    this._resetWindowScrollPosition();

    this.$window = $(window);

    this.windowScrollTop = this.$window.scrollTop();
    this.articleOffsetTop = this.$el.offset().top;
    this.articleHeight = this.$el.height();
    this.articleScrollTop = this.articleHeight;
    this.heightOfAllArticles = 0;
    this.isNextArticleLoading = false;

    this.template = require("./article.hbs");

    this.articles = new Map();
    this.viewedArticles = [];
    this.listOfArticles = [];
    this.paginatedArticles = {};

    this.delay = 1500;

    this._updateValuesAfterTimeout();
    this._setFirstArticle();
    this._createInitialListOfArticles();
  }

  /**
   * Reset the window's previous scroll position when the page loads
   */
  _resetWindowScrollPosition() {
    window.onunload = function() {
      $(window).scrollTop(0);
    };
  }

  /**
   * Set the first article
   */
  _setFirstArticle() {
    this.howManyArticlesHaveLoaded = 1;
    this.$activeArticle = this.$el.addClass("is-active");

    // Add the first article to the map
    this.articles.set(this.$el[0], {
      title: this.$activeArticle.data("title"),
      slug: this.$activeArticle.data("slug")
    });

    // Add the first article to the list of viewed articles
    this.viewedArticles.push({
      slug: this.$el.data("slug"),
      title: this.$el.data("title")
    });
  }

  /**
   * Use a timeout to wait for all of the article's assets to load and then
   * update the values needed for accurate scrolling calculations
   */
  _updateValuesAfterTimeout() {
    // setTimeout is because of webfonts and images; probably need to use
    // hasImagesLoaded and a webfont loader
    setTimeout(() => {
      this.articleHeight = this.$el.height();
      this.articlePaginationHeight = this.$el.find(".article-pagination").outerHeight(true);
      this.articleOffsetBottom = $(document).height() - this.articleHeight - this.articleOffsetTop;
      this.scrollOffset = this.articleOffsetBottom + this.articleOffsetTop + this.articlePaginationHeight;
      this.articleScrollTop = this.articleHeight - this.scrollOffset;
      this.heightOfAllArticles += this.articleScrollTop;
    }, this.delay);
  }

  /**
   * Get related articles via AJAX
   * @param  {String}  url Article URL to query
   * @return {Promise}     A promise for when the AJAX request finishes
   */
  _getRelatedArticles(url) {
    return new Promise((resolve, reject) => {
      $.ajax(url, {
        success: (response) => {
          resolve(response.article.related_articles.articles);
        },
        error: (xhrObj, textStatus, error) => {
          reject(Error(error));
        }
      });
    });
  }

  /**
   * Creates the initial list of articles and sets the next article that will be
   * loaded; this method is to be called when the component initializes
   */
  _createInitialListOfArticles() {
    this._getRelatedArticles(`${window.location.pathname}.json`).then((response) => {
      this.listOfArticles = response;
      this.windowScrollTop = this.$window.scrollTop();
      this._setNextArticle();
      this._setArticlePagination(1);
      this._createArticlePagination(this.$el);
      this._scrollToNextArticle();
    });
  }

  /**
   * Sets the next and previous articles for the pagination element
   * @param {Integer} offset The number to be subtracted from each count to get
   *                         the correct index
   */
  _setArticlePagination(offset) {
    let nextCount = (this.howManyArticlesHaveLoaded * 2);
    let previousCount = (this.howManyArticlesHaveLoaded * 2) + 1;

    this.paginatedArticles.next = this.listOfArticles[nextCount - offset];
    this.paginatedArticles.previous = this.listOfArticles[previousCount - offset];
  }

  /**
   * Adds data to the next and previous pagination links
   * @param {Object} $article The article that contains the pagination element
   *                          that is to be updated
   */
  _createArticlePagination($article) {
    let $pagination = $article.find(".article-pagination");
    let next = this.paginatedArticles.next;
    let previous = this.paginatedArticles.previous;

    if (next && previous) {
      $pagination.find(".is-prev").attr("href", `/${previous.slug}`).html(previous.title);
      $pagination.find(".is-next").attr("href", `/${next.slug}`).html(next.title);
      $pagination.removeClass("is-hidden");
    }
  }

  /**
   * Sets the next article by subtracting one from the number of articles loaded
   */
  _setNextArticle() {
    this.nextArticle = this.listOfArticles[this.howManyArticlesHaveLoaded - 1];
  }

  /**
   * Runs methods when scrolling
   */
  _scrollToNextArticle() {
    console.log("Ready");

    this.$window.on("scroll.article", debounce(() => {
      this.windowScrollTop = this.$window.scrollTop();

      // Determine if a new article should be loaded. There are two ways to do
      // this:
      //
      // 1. When scrolled a certain amount past the beginning of an article `this.windowScrollTop >= (this.articleOffsetTop + 300)`
      // 2. When scrolled to the end of the article `this.windowScrollTop >= this.articleScrollTop`
      if(this.windowScrollTop >= (this.articleOffsetTop + 300)) {
        if (this.isNextArticleLoading === false) {
          if (this.nextArticle) {
            this._getNextArticle(`/${this.nextArticle.slug}.json`);
          }
        }
      }

      this.articles.forEach((data, article) => {
        this._toggleActiveClassForArticle(article);
      });

      this._updateHistoryForActiveArticle();
    }, 10));
  }

  /**
   * Check scroll top against each value in the map and add or remove the active
   * class to the `$article` element
   * @param  {Object} article The article object from the map
   */
  _toggleActiveClassForArticle(article) {
    if (this.windowScrollTop) {
      let top = article.offsetTop;
      let bottom = top + article.offsetHeight;
      let shouldActiveClassBeAdded = this.windowScrollTop < bottom && this.windowScrollTop > top;

      if (shouldActiveClassBeAdded) {
        this.$activeArticle = $(article)
          .addClass("is-active");

      } else {
        $(article)
          .removeClass("is-active");

      }
    }
  }

  /**
   * Find the active article and update the browser history
   */
  _updateHistoryForActiveArticle() {
    if (this.$activeArticle.hasClass("is-active")) {
      this._updateHistory(
        window.location.pathname,
        this.$activeArticle.data("title"),
        this.$activeArticle.data("slug")
      );
    }
  }

  /**
   * Loops through a given array and compares each slug in the given array with
   * a predefined slug that's passed in.
   * @param  {Array}  array An array of articles to loop through
   * @param  {String} slug  A slug to compare each item of the array against
   * @return {Boolean}
   */
  _doesItemExist(array, slug) {
    for (let i = 0; i < array.length; i++) {
      return slug === array[i].slug;
    }
  }

  /**
   * Use an AJAX call to get data for a new article
   * @param {String} slug Pathname of article to get
   */
  _getNextArticle(slug) {
    console.log(`Article ${this.howManyArticlesHaveLoaded + 1} is loading…`);

    this.isNextArticleLoading = true;

    this.$activeArticle.after(`<div class="article-loading"><span></span></div>`);

    $.ajax(slug, {
      success: (data) => {
        this.$newArticle = $(this.template(data))
          .appendTo(".page-container");

        // Set the new article element and data to the articles map
        this.articles.set(this.$newArticle[0], data.article);

        this._addNewArticlesToArray(data.article.related_articles.articles);
        this._updateNewArticle();
        this._resetArticleDimensions();

        this.isNextArticleLoading = false;

        $(".article-loading").remove();

        console.log(`Article ${this.howManyArticlesHaveLoaded} is done`);
      },
      error: () => {
        this.isNextArticleLoading = false;

        // @TODO Maybe do something more substantial here
        console.log(`Article ${this.howManyArticlesHaveLoaded + 1} is done with errors`);
      }
    });
  }

  /**
   * Updates a newly created article
   */
  _updateNewArticle() {
    new ArticleBodyComponent({el: this.$newArticle});

    // Set the scrollTop for the new article; this will not be accurate because
    // the article has not fully loaded (due to fonts and images), therefore,
    // the scrollTop will be set again inside of a timeout that's in the reset
    // method. Even though it's incorrect, the scrollTop needs to be set here
    // intially so that the new article's scrollTop is greater than the
    // previous.
    this.articleScrollTop = this.articleHeight + this.$newArticle.height();

    this.articleOffsetTop = this.$newArticle.offset().top;

    this.howManyArticlesHaveLoaded += 1;

    let previousArticle = this.listOfArticles[this.howManyArticlesHaveLoaded - 2];
    this.viewedArticles.push(previousArticle);

    this._setNextArticle();
    this._setArticlePagination(2);
    this._createArticlePagination(this.$newArticle);
  }

  /**
   * Array of new items to add; loop through the new array of articles and check
   * that each item doesn't already exist in the `viewedArticles` array or the
   * `listOfArticles` array; push each unique item to the `listOfArticles` Array
   * @param {Array} array Array of new articles to add
   */
  _addNewArticlesToArray(array) {
    for (let i = 0; i < array.length; i++) {
      let slug = array[i].slug;
      let hasItemBeenViewed = this._doesItemExist(this.viewedArticles, slug);
      let isItemInList = this._doesItemExist(this.listOfArticles, slug);

      if (!hasItemBeenViewed && !isItemInList) {
        this.listOfArticles.push(array[i]);
      }
    }
  }

  /**
   * Recalculate the article dimensions; called after a new article is loaded
   * into view
   */
  _resetArticleDimensions() {
    this.windowScrollTop = this.$window.scrollTop();

    // Use a timeout to get the actual dimensions after the article has fully
    // loaded into place
    setTimeout(() => {
      this.articleHeight = this.$newArticle.height();
      this.heightOfAllArticles += this.articleHeight;
      this.articleScrollTop = this.heightOfAllArticles;
    }, this.delay);
  }

  /**
   * Use HTML5 pushState to update the browser's history
   * @param {String} pathname The window's current pathname
   * @param {String} title    Title of the new "page"
   * @param {String} slug     Pathname of the new "page"
   */
  _updateHistory(pathname, title, slug) {
    if (window.history && window.history.pushState) {
      if (pathname !== `/${slug}`) {
        history.pushState(null, title, `/${slug}`);
        this._notifyAnalytics(`/${slug}`);
      }
    }
  }

  /**
   * Send a page view for analytics
   * @param {String} path Pathname of page to track
   */
  _notifyAnalytics(path) {
    utag.view({
      ga_location_override: path
    });
  }
}
