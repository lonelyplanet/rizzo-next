import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/debounce";
import ArticleBodyComponent from "../article_body";
import SocialShareComponent from "../social_share";
import track from "../../core/decorators/track";
import publish from "../../core/decorators/publish";
import waitForTransition from "../../core/utils/waitForTransition";
import ArticleModel from "./article_model";
import rizzo from "../../rizzo";
import subscribe from "../../core/decorators/subscribe";
import matchMedia from "../../core/utils/matchMedia";
import breakpoints from "../../core/utils/breakpoints";
import StickyFooterComponent from "../sticky_footer";
import { slugify } from "../../core/utils/stringHelpers";

export default class ArticleComponent extends Component {
  initialize() {
    this.canUseScrollFeature = window.history && window.history.replaceState;

    this.subscribe();

    this._resetWindowScrollPosition();

    this.$document = $("html");
    this.$window = $(window);

    this.isNextArticleLoading = false;
    this.howManyArticlesHaveLoaded = 1;
    this.maxAdTimeout = 500;

    this.template = require("./article.hbs");
    this.loader = require("./article-loading.hbs");
    this.adLeaderboardTemplate = require("../ads/ad_article_leaderboard.hbs");

    this.articles = new Map();
    this.viewedArticles = [];
    this.listOfArticles = [];
    this.state = {};

    this.$globalFooter = $(".lp-global-footer");

    this._setFirstArticle();
    this._detachGlobalFooter();
  }

  _detachGlobalFooter() {
    this.$globalFooter.detach();
  }

  @subscribe("ad.loaded", "ads");
  _adsLoaded(data) {
    if (data.size === "leaderboard-responsive") {
      if (!this.hasAdTimeoutResolved) {
        clearTimeout(this.adTimer);
        this.adLoadedPromise && this.adLoadedPromise();
      }
    }
  }

  _createIdForArticle(slug) {
    return slug.split("/")[slug.split("/").length - 1];
  }

  /**
   * Reset the window's previous scroll position when the page loads
   */
  _resetWindowScrollPosition() {
    window.onunload = function() {
      $(window).scrollTop(0);
    };
  }

  _createStickyFooter() {
    this.stickyFooterComponent = new StickyFooterComponent({
      el: $(".lp-sticky-footer")
    });
  }

  _loadStickyFooter() {
    this.stickyFooterComponent.update(
      this.$el.offset().top,
      this._getAmountNeededToScroll(),
      this.state
    );

    matchMedia(`(min-width: ${breakpoints.min["720"]})`, (query) => {
      if (query.matches) {
        this.stickyFooterComponent.attach();
        this.stickyFooterComponent.scroll();
      } else {
        this.stickyFooterComponent.detach();
      }
    });
  }

  /**
   * Set the first article
   */
  _setFirstArticle() {
    this.$activeArticle = this.$el.addClass("is-active");

    this.socialShareComponent = new SocialShareComponent({
      el: this.$el.find(".js-action-sheet")
    });

    let firstArticle = new ArticleModel({
      url: `${window.location.pathname}.json`
    });

    firstArticle.set(window.lp.article_raw);
    let relatedArticles = firstArticle.get("related_articles").articles;

    this.articles.set(this.$el[0], firstArticle);
    this._setInitialCallouts(firstArticle.get("content").callouts);

    if (relatedArticles.length) {
      this.$el.attr("id", this._createIdForArticle(this.$el.data("slug")));
      this._setInitialListOfArticles(relatedArticles);
      this._updateFirstArticle();
      this._createStickyFooter();
      this._loadStickyFooter();
    }

    // Put the ad in the first article, but don't load it yet
    this.$activeArticle.append(this.adLeaderboardTemplate());
  }

  _updateFirstArticle() {
    // Add the first article to the list of viewed articles
    this.viewedArticles.push({
      slug: this.$el.data("slug"),
      title: this.$el.data("title"),
      scroll: {
        articleOffsetTop: this.$el.offset().top,
        amountNeededToScroll: this._getAmountNeededToScroll()
      },
      next: {
        slug: this.nextArticle.slug,
        title: this.nextArticle.title
      }
    });

    this.state = {
      current: {
        title: this.$el.data("title")
      },
      next: {
        slug: this.nextArticle.slug,
        title: this.nextArticle.title
      }
    };
  }

  _setInitialCallouts(callouts) {
    this.articleBody = new ArticleBodyComponent({
      el: this.$el.find(".js-article-body"),
      poiData: callouts
    });
  }

  _setInitialListOfArticles(articles) {
    this.listOfArticles = articles;
    this._setNextArticle();

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
   * Sets the next article by subtracting one from the number of articles loaded
   */
  _setNextArticle() {
    this.nextArticle = this.listOfArticles[this.howManyArticlesHaveLoaded - 1];
  }

  /**
   * Runs methods when scrolling
   */
  _scrollToNextArticle(offsetDifference = 0) {
    let shouldGetNextArticle = false;
    let hasRecalculatedStickyFooter = false;

    this.$window.on("scroll.article", debounce(() => {
      let activeArticle = this.articles.get(this.$activeArticle[0]);

      shouldGetNextArticle = this._shouldGetNextArticle(offsetDifference) &&
        !this.isNextArticleLoading &&
        typeof this.nextArticle !== "undefined";

      if (shouldGetNextArticle && !activeArticle.get("hasFetched")) {
        activeArticle.set("hasFetched", true);
        this._getNextArticle(`/${this.nextArticle.slug}.json`).then(() => {
          this._reloadAd();
        });
      }

      this._setActiveArticle();
      this._checkIfHistoryShouldBeUpdated();

      if (!hasRecalculatedStickyFooter) {
        hasRecalculatedStickyFooter = true;
        this.stickyFooterComponent.recalculate(this._getAmountNeededToScroll());
        this.viewedArticles[this.howManyArticlesHaveLoaded - 1].scroll.amountNeededToScroll = this._getAmountNeededToScroll();
      }
    }, 50));
  }

  _setActiveArticle() {
    this.articles.forEach((model, $article) => {
      this._toggleActiveClassForArticle($article);
    });
  }

  _shouldGetNextArticle(difference) {
    let reset = this.$newArticle ? this.$newArticle.offset().top : 0;
    let amountNeededToScroll = this._getAmountNeededToScroll();
    let calculatedAmount = (amountNeededToScroll - difference - reset) * 0.8;

    return this.$window.scrollTop() - reset >= calculatedAmount;
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
        amountToScrollPastEndOfArticle = 0,
        globalFooterHeight = this.$globalFooter.height();

    return roomToScroll - amountToScrollPastEndOfArticle - globalFooterHeight;
  }

  /**
   * Check scroll top against each value in the map and add or remove the active
   * class to the `$article` element
   * @param  {Object} $article The article object from the map
   */
  _toggleActiveClassForArticle($article) {
    if (this.$window.scrollTop()) {
      let top = $($article).offset().top,
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
    if (this.$activeArticle.hasClass("is-active") && this.$newArticle) {
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
      .insertAfter(this.$activeArticle);

    let nextArticle = new ArticleModel({ url: slug });

    return nextArticle.fetch().then(() => {
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

      this.$newArticle.attr("id", this._createIdForArticle(nextArticle.get().slug));

      // Put the ad in the new article, but don't load it yet
      this.$newArticle.append(this.adLeaderboardTemplate());

      this._articleCanBeLoaded();

      this.isNextArticleLoading = false;
    }).catch(() => {
      let errorMessage = `"<a href="${this.nextArticle.slug}">${this.nextArticle.title}</a>"
        could not be loaded. Please view it <a href="${this.nextArticle.slug}">here</a>.`;
      this.nextArticle = false;
      this.isNextArticleLoading = false;
      this._hideLoader({ showArticle: false });
      rizzo.logger.error(`Unable to fetch ${slug}.json`);
      this.$activeArticle.append(`<div class="article-error">${errorMessage}</div>`);
    });
  }

  @publish("loaded", "articles")
  _articleCanBeLoaded() {
    new Promise(resolve => {
      this.adLoadedPromise = resolve;
      this.adTimer = setTimeout(() => {
        this.hasAdTimeoutResolved = true;
        resolve();
      }, this.maxAdTimeout);
    }).then(() => {
      this._hideLoader({ showArticle: true });
    });

    return {
      id: this.$newArticle.attr("id")
    };
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

    this.socialShareComponent = new SocialShareComponent({
      el: this.$newArticle.find(".js-action-sheet")
    });

    this.howManyArticlesHaveLoaded += 1;

    this._setNextArticle();
    this._checkIfHistoryShouldBeUpdated();
  }

  /**
   * Finds the previously viewed article and adds it to the array of viewed
   * articles
   */
  _updateListOfViewedArticles() {
    let previousArticle = this.listOfArticles[this.howManyArticlesHaveLoaded - 2];

    if (previousArticle) {
      previousArticle.next = {
        slug: this.nextArticle.slug,
        title: this.nextArticle.title
      };

      try {
        previousArticle.scroll = {
          articleOffsetTop: this.$newArticle.offset().top,
          amountNeededToScroll: this._getAmountNeededToScroll()
        };
      } catch(e) {
        rizzo.logger.error(`
          Couldn't find ${this.$newArticle} in _updateListOfViewedArticles().
          $newArticles: ${this.$newArticle.length}
        `);
      }

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
   * Use HTML5 replaceState to update the browser's history
   * @param {String} pathname The window's current pathname
   * @param {String} title    Title of the new "page"
   * @param {String} slug     Pathname of the new "page"
   */
  _updateHistory(pathname, title, slug) {
    if (pathname !== `/${slug}`) {
      window.history.replaceState(null, `${title} - Lonely Planet`, `/${slug}`);

      this._updateData();

      this.state.current.title = title;

      if(!this._doesItemExist(this.viewedArticles, slug)) {
        this.state.next.slug = this.nextArticle.slug;
        this.state.next.title = this.nextArticle.title;

        this._trackAjaxPageView(`/${slug}`);
        this._updateListOfViewedArticles();
      }

      let articleOffsetTop,
          amountNeededToScroll;

      try {
        articleOffsetTop = this.$newArticle.offset().top;
        amountNeededToScroll = this._getAmountNeededToScroll();
      } catch(e) {
        rizzo.logger.error(`
          Couldn't find ${this.$newArticle} in _updateHistory().
          $newArticles: ${this.$newArticle.length}
        `);
      }

      this.viewedArticles.forEach((item) => {
        if (item.title === title) {
          this.state.next.slug = item.next.slug;
          this.state.next.title = item.next.title;
          articleOffsetTop = item.scroll.articleOffsetTop;
          amountNeededToScroll = item.scroll.amountNeededToScroll;
        }
      });

      this.stickyFooterComponent.update(
        articleOffsetTop,
        amountNeededToScroll,
        this.state
      );
    }
  }

  /**
   * Track a virtual pageview for analytics
   * @param  {String} pathname Pathname to send to analytics
   * @param  {String} title    Title to send to analytics
   * @return {String}          Data to send to analytics
   */
  @track("article pageview scroll");
  _trackAjaxPageView(pathname) {
    window.lp.analytics.api.trackEvent({
      category: "Page View",
      action: "Modal Location Override",
      label: pathname
    });
    return pathname;
  }

  /**
   * Update data for ads and analytics
   */
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

    window.lp.ads.tnm = `tip-article, ${article.tealium.place.id}`;
    window.lp.ads.continent = article.tealium.article.cd1_Continent ? slugify(article.tealium.article.cd1_Continent) : "";
    window.lp.ads.country = article.tealium.article.cd2_Country ? slugify(article.tealium.article.cd2_Country) : "";
    window.lp.ads.destination = slugify(article.tealium.place.destination);
    window.lp.ads.state = slugify(article.tealium.place.state_name);
    window.lp.ads.region = slugify(article.tealium.place.region_name);
    window.lp.ads.city = slugify(article.tealium.article.cd3_City);
    window.lp.ads.interest = window.lp.article.interests;
    window.lp.ads.position = `article-${article.articleNumber}`;

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

  @publish("reload", "ads")
  _reloadAd() {
    let $slotLeader = this.$activeArticle.find(".js-slot-leader");

    if ($slotLeader.length) {
      $slotLeader.data({
        adType: "ajax",
        targeting: { position: window.lp.ads.position }
      })
      .removeAttr("data-targeting");
    }
  }
}
