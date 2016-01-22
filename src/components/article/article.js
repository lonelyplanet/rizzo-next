import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/function/debounce";
import ArticleBodyComponent from "../article_body";
import SocialShareComponent from "../social_share";
import track from "../../core/decorators/track";
import publish from "../../core/decorators/publish";
import waitForTransition from "../../core/utils/waitForTransition";
import ArticleModel from "./article_model";

export default class ArticleComponent extends Component {
  initialize() {
    this.canUseScrollFeature = window.history && window.history.pushState;

    this._resetWindowScrollPosition();

    this.$document = $(document);
    this.$window = $(window);
    this.$footer = $(".footer");

    this.isNextArticleLoading = false;
    this.howManyArticlesHaveLoaded = 1;

    this.template = require("./article.hbs");
    this.loader = require("./article-loading.hbs");

    this.articles = new Map();
    this.viewedArticles = [];
    this.listOfArticles = [];
    this.paginatedArticles = {};

    this._setFirstArticle();

    this.events = {
      "click .article-pagination__item": "_trackArticlePagination"
    };
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
   * Take a given string and turn it into a slug
   * @param  {String} string String to slugify
   * @return {String}
   */
  _slugify(string) {
    return string.toLowerCase().replace(" ", "-");
  }

  /**
   * Set the first article
   */
  _setFirstArticle() {
    this.$activeArticle = this.$el.addClass("is-active");

    // Add the first article to the list of viewed articles
    this.viewedArticles.push({
      slug: this.$el.data("slug"),
      title: this.$el.data("title")
    });

    this.socialShare = new SocialShareComponent({
      el: this.$el.find(".js-action-sheet")
    });

    let firstArticle = new ArticleModel({ 
      url: `${window.location.pathname}.json`
    });

    firstArticle.fetch().then(() => {
      this.articles.set(this.$el[0], firstArticle);
      this._setInitialListOfArticles(firstArticle.get("related_articles").articles);
      this._setInitialCallouts(firstArticle.get("content").callouts);
    });
  }

  _setInitialCallouts(callouts) {
    this.articleBody = new ArticleBodyComponent({
      el: this.$el.find(".article-body"),
      poiData: callouts
    });
  }

  _setInitialListOfArticles(articles) {
    this.listOfArticles = articles;
    this._setNextArticle();
    this._setArticlePagination(1);
    this._createArticlePagination(this.$el);

    if (this.canUseScrollFeature) {
      let roomToScroll = this._getRoomToScroll(),
          amountNeededToScroll = this._getAmountNeededToScroll();

      if (roomToScroll < amountNeededToScroll) {
        this._scrollToNextArticle(amountNeededToScroll - roomToScroll);
      } else {
        this._scrollToNextArticle();
      }
    }
  }

  /**
   * Sets the next and previous articles for the pagination element
   * @param {Integer} offset The number to be subtracted from each count to get
   *                         the correct index
   */
  _setArticlePagination(offset) {
    let nextCount = (this.howManyArticlesHaveLoaded * 2),
        previousCount = (this.howManyArticlesHaveLoaded * 2) + 1;

    this.paginatedArticles.next = this.listOfArticles[nextCount - offset];
    this.paginatedArticles.previous = this.listOfArticles[previousCount - offset];
  }

  /**
   * Adds data to the next and previous pagination links
   * @param {Object} $article The article that contains the pagination element
   *                          that is to be updated
   */
  _createArticlePagination($article) {
    let $pagination = $article.find(".article-pagination"),
        next = this.paginatedArticles.next,
        previous = this.paginatedArticles.previous;

    if (next && previous) {
      $pagination.find(".is-prev").attr("href", `/${previous.slug}`).html(previous.title);
      $pagination.find(".is-next").attr("href", `/${next.slug}`).html(next.title);
      $pagination.removeClass("is-hidden");
    }
  }

  @track("article pageview click");
  _trackArticlePagination() {
    let href = $(event.target).attr("href");

    return href;
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
  _scrollToNextArticle(offsetDifference = 0) {
    this.$window.on("scroll.article", debounce(() => {
      if (this._shouldGetNextArticle(offsetDifference)) {
        if (!this.isNextArticleLoading) {
          if (this.nextArticle) {
            this._getNextArticle(`/${this.nextArticle.slug}.json`);
          }
        }
      }

      this._setActiveArticle();
      this._checkIfHistoryShouldBeUpdated();
    }, 10));
  }

  _setActiveArticle() {
    this.articles.forEach((model, $article) => {
      this._toggleActiveClassForArticle($article);
    });
  }
  
  _shouldGetNextArticle(difference) {
    let amountNeededToScroll = this._getAmountNeededToScroll();
    
    return this.$window.scrollTop() >= (amountNeededToScroll - difference);
  }

  /**
   * Return how much room is available to scroll
   * @return {Number}
   */
  _getRoomToScroll() {
    return this.$document.height() - this.$window.height();
  }

  /**
   * Return the amount needed to scroll in order to load a new article
   * @return {Number}
   */
  _getAmountNeededToScroll() {
    let roomToScroll = this._getRoomToScroll(),
        amountToScrollPastEndOfArticle = 100;

    return roomToScroll - this.$footer.height() + amountToScrollPastEndOfArticle;
  }

  /**
   * Check scroll top against each value in the map and add or remove the active
   * class to the `$article` element
   * @param  {Object} $article The article object from the map
   */
  _toggleActiveClassForArticle($article) {
    if (this.$window.scrollTop()) {
      let top = $article.offsetTop,
          bottom = top + $article.offsetHeight,
          shouldActiveClassBeAdded = this.$window.scrollTop() < bottom && this.$window.scrollTop() > top;

      if (shouldActiveClassBeAdded) {
        this.$activeArticle = $($article).addClass("is-active");
      } else {
        $($article).removeClass("is-active");
      }
    }
  }

  /**
   * Find the active article and update the browser history
   */
  _checkIfHistoryShouldBeUpdated() {
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
    let exists = false;

    for (let i = 0; i < array.length; i++) {
      exists = slug === array[i].slug;

      if (exists) {
        break;
      }
    }

    return exists;
  }

  /**
   * Use an AJAX call to get data for a new article
   * @param {String} slug Pathname of article to get
   */
  _getNextArticle(slug) {
    this.isNextArticleLoading = true;

    this.$loader = $(this.loader({}))
      .appendTo(this.$activeArticle);

    let nextArticle = new ArticleModel({ url: slug });

    nextArticle.fetch().then(() => {
        this.$newArticle = $(this.template({
          article: nextArticle.get()
        }))
        .appendTo(".page-container")
        .addClass("is-loading");

      // Set the new article element and data to the articles map
      this.articles.set(this.$newArticle[0], nextArticle);
      nextArticle.set("articleNumber", this.articles.size);

      this._addNewArticlesToArray(nextArticle.get("related_articles").articles);
      this._updateNewArticle(nextArticle);

      this.isNextArticleLoading = false;
      this._hideLoader({ showArticle: true });
    }, () => {
      this.isNextArticleLoading = false;
      this._hideLoader({ showArticle: false });
    });
  }

  _hideLoader(options) {
    this.$loader.addClass("is-invisible");

    return waitForTransition(this.$loader, { fallbackTime: 1000 })
      .then(() => {
        this.$loader.remove();

        if (options.showArticle) {
          this.$newArticle.removeClass("is-loading");
        }
      });
  }

  /**
   * Updates a newly created article
   */
  _updateNewArticle(model) {
    this.articleBody = new ArticleBodyComponent({
      el: this.$newArticle.find(".article-body"),
      poiData: model.get("content").callouts
    });

    this.socialShare = new SocialShareComponent({
      el: this.$newArticle.find(".js-action-sheet")
    });

    this.howManyArticlesHaveLoaded += 1;

    this._setNextArticle();
    this._setArticlePagination(2);
    this._createArticlePagination(this.$newArticle);
    this._checkIfHistoryShouldBeUpdated();
    this._newArticleLoaded();
  }

  /**
   * Finds the previously viewed article and adds it to the array of viewed
   * articles
   */
  _updateListOfViewedArticles() {
    let previousArticle = this.listOfArticles[this.howManyArticlesHaveLoaded - 2];

    if (previousArticle) {
      this.viewedArticles.push(previousArticle);
    }
  }

  /**
   * Array of new items to add; loop through the new array of articles and check
   * that each item doesn't already exist in the `viewedArticles` array or the
   * `listOfArticles` array; push each unique item to the `listOfArticles` Array
   * @param {Array} array Array of new articles to add
   */
  _addNewArticlesToArray(array) {
    for (let i = 0; i < array.length; i++) {
      let slug = array[i].slug,
          hasItemBeenViewed = this._doesItemExist(this.viewedArticles, slug),
          isItemInList = this._doesItemExist(this.listOfArticles, slug);

      if (!hasItemBeenViewed && !isItemInList) {
        this.listOfArticles.push(array[i]);
      }
    }
  }

  /**
   * Use HTML5 pushState to update the browser's history
   * @param {String} pathname The window's current pathname
   * @param {String} title    Title of the new "page"
   * @param {String} slug     Pathname of the new "page"
   */
  _updateHistory(pathname, title, slug) {
    if (pathname !== `/${slug}`) {
      history.pushState(null, `${title} - Lonely Planet`, `/${slug}`);

      this._updateData();

      if(!this._doesItemExist(this.viewedArticles, slug)) {
        this._trackAjaxPageView(`/${slug}`, title);
        this._updateListOfViewedArticles();
      }
    }
  }

  /**
   * Track a virtual pageview for analytics
   * @param  {String} pathname Pathname to send to analytics
   * @param  {String} title    Title to send to analytics
   * @return {String}          Data to send to analytics
   */
  @track("article pageview scroll");
  _trackAjaxPageView(pathname, title) {
    utag.view({
      ga_location_override: pathname,
      title: `${title} - AJAX`
    });

    return pathname;
  }

  /**
   * Update data for ads and analytics
   */
  @publish("reload", "ads")
  _updateData() {
    let article = this.articles.get(this.$activeArticle[0]).get(),
        interests = article.tealium.article.interests,
        categories = [],
        regex = /,\s*$/;

    window.lp.article = {
      name: article.title,
      slug: article.slug,
      image: article.image,
      postDate: article.post_date,
      author: article.author,
      atlasId: article.tealium.article.atlas_id,
      continentName: article.tealium.article.cd1_Continent,
      countryName: article.tealium.article.cd2_Country,
      cityName: article.tealium.article.cd3_City,
      type: article.tealium.article.page_type,
      siteSection: article.tealium.article.site_section,
      id: article.tealium.place.id,
      destination: article.tealium.place.destination
    };

    if (typeof interests === "object") {
      window.lp.article.interests = interests.join(", ").replace(regex, "");
    } else {
      window.lp.article.interests = interests.replace(regex, "");
    }

    if (typeof article.categories === "object") {
      $.each(article.categories, (index, value) => {
        categories.push(value.name);
      });

      window.lp.article.categories = categories.join(", ").replace(regex, "");
    } else {
      window.lp.article.categories = article.categories;
    }

    window.lp.ads.adThm = `tip-article, ${article.tealium.place.id}`;
    window.lp.ads.continent = article.tealium.article.cd1_Continent ? this._slugify(article.tealium.article.cd1_Continent) : "";
    window.lp.ads.country = article.tealium.article.cd2_Country ? this._slugify(article.tealium.article.cd2_Country) : "";
    window.lp.ads.destination = this._slugify(article.tealium.place.destination);
    window.lp.ads.interest = window.lp.article.interests;
    window.lp.ads.position = article.articleNumber;

    this._updateMetaData(window.lp.article);
  }

  /**
   * Update meta data
   * @param {Object} article Article data from window.lp.article
   */
  _updateMetaData(article) {
    let documentTitle = `${article.name} - Lonely Planet`,
        description = `Read ${article.name}`,
        url = `https://www.lonelyplanet.com/${article.slug}`;

    // Title
    document.title = documentTitle;
    $("meta[name=title]").attr("content", documentTitle);
    $(`meta[property="og:title"]`).attr("content", documentTitle);

    // Description
    $("meta[name=description]").attr("content", description);
    $("meta[itemprop=description]").attr("content", description);
    $(`meta[property="og:description"]`).attr("content", description);

    // URL
    $(`meta[property="og:url"]`).attr("content", url);
    $("link[rel=canonical]").attr("href", url);

    // Image
    $("meta[itemprop=image]").attr("content", article.image);
    $(`meta[property="og:image"]`).attr("content", article.image);

    // Article
    $(`meta[property="article:tag"]`).attr("content", article.categories);
    $(`meta[property="article:published_time"]`).attr("content", article.postDate);
    $(`meta[property="article:author"]`).attr("content", article.author);
  }

  _newArticleLoaded() {
    let $slot = this.$newArticle.find(".adunit");

    if ($slot.length) {
      $slot.data({
        adType: "ajax",
        targeting: null
      })
      .removeAttr("data-targeting");
    }
  }
}
