import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/function/debounce";
import ArticleBodyComponent from "../article_body";
import ActionSheetComponent from "../action_sheet";
import track from "../../core/decorators/track";
import waitForTransition from "../../core/utils/waitForTransition";

export default class ArticleComponent extends Component {
  initialize() {
    this.canUseScrollFeature = window.history && window.history.pushState;

    this._resetWindowScrollPosition();

    this.$document = $(document);
    this.$window = $(window);
    this.$footer = $(".footer");

    this.isNextArticleLoading = false;

    this.template = require("./article.hbs");
    this.loader = require("./article-loading.hbs");

    this.articles = new Map();
    this.viewedArticles = [];
    this.listOfArticles = [];
    this.paginatedArticles = {};

    this.nextSlotId = 1;
    this.adPath = `/${window.lp.ads.networkId}/${window.lp.ads.layers.join("/")}`;

    this._slugifyPlaceDataForAds();
    this._setFirstArticle();

    // Wait for utag
    setTimeout(() => {
      this._loadFirstAd();
    }, 500);

    this.events = {
      "click .article-pagination__item": "_trackArticlePagination"
    };
  }

  _slugifyPlaceDataForAds() {
    window.lp.ads.continent = this._slugify(window.lp.ads.continent);
    window.lp.ads.country = this._slugify(window.lp.ads.country);
    window.lp.ads.destination = this._slugify(window.lp.ads.destination);
    window.lp.ads.interest = window.lp.ads.interest.replace(/,\s*$/, "");
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
    this.howManyArticlesHaveLoaded = 1;
    this.$activeArticle = this.$el.addClass("is-active");

    let article = window.lp.article;

    // Add the first article to the map
    this.articles.set(this.$el[0], {
      title: article.name,
      slug: article.slug,
      image: article.image,
      post_date: article.postDate,
      categories: article.categories,
      author_details: {
        name: article.author
      },
      tealium: {
        article: {
          atlas_id: article.atlasId,
          cd1_Continent: article.continentName,
          cd2_Country: article.countryName,
          cd3_City: article.cityName,
          page_type: article.type,
          site_section: article.siteSection,
          interests: article.interests
        },
        place: {
          id: article.id,
          destination: article.destination
        }
      }
    });

    // Add the first article to the list of viewed articles
    this.viewedArticles.push({
      slug: this.$el.data("slug"),
      title: this.$el.data("title")
    });

    this.actionSheet = new ActionSheetComponent({
      el: this.$el.find(".js-action-sheet")
    });

    this._getDataForInitialArticle(`${window.location.pathname}.json`).then((response) => {
      this._setInitialListOfArticles(response.related_articles.articles);
      this._setInitialCallouts(response.content.callouts);
    });
  }

  /**
   * Create a promise for the AJAX call to get data for the first article
   * @param  {String}  url Article URL to query
   * @return {Promise}     A promise for when the AJAX request finishes
   */
  _getDataForInitialArticle(url) {
    return new Promise((resolve, reject) => {
      $.ajax(url, {
        success: (response) => {
          resolve(response.article);
        },
        error: (xhrObj, textStatus, error) => {
          reject(Error(error));
        }
      });
    });
  }

  /**
   * Create a promise for the AJAX call to get a new article
   * @param  {String}  slug Pathname of request
   * @return {Promise}      A promise for when the AJAX request finishes
   */
  _promiseForNextArticle(slug) {
    return new Promise((resolve, reject) => {
      $.ajax(slug, {
        success: (response) => {
          resolve(response);
        },
        error: (xhrObj, textStatus, error) => {
          reject(Error(error));
        }
      });
    });
  }

  _setInitialCallouts(response) {
    this.articleBody = new ArticleBodyComponent({
      el: this.$el.find(".article-body"),
      poiData: response
    });
  }

  _setInitialListOfArticles(response) {
    this.listOfArticles = response;
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
  _scrollToNextArticle(offsetDifference) {
    offsetDifference = offsetDifference ? offsetDifference : 0;

    this.$window.on("scroll.article", debounce(() => {
      let amountNeededToScroll = this._getAmountNeededToScroll(),
          shouldGetNextArticle = this.$window.scrollTop() >= (amountNeededToScroll - offsetDifference);

      if (shouldGetNextArticle) {
        if (!this.isNextArticleLoading) {
          if (this.nextArticle) {
            this._getNextArticle(`/${this.nextArticle.slug}.json`);
          }
        }
      }

      this.articles.forEach((data, article) => {
        this._toggleActiveClassForArticle(article);
      });

      this._checkIfHistoryShouldBeUpdated();
    }, 10));
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
   * @param  {Object} article The article object from the map
   */
  _toggleActiveClassForArticle(article) {
    if (this.$window.scrollTop()) {
      let top = article.offsetTop,
          bottom = top + article.offsetHeight,
          shouldActiveClassBeAdded = this.$window.scrollTop() < bottom && this.$window.scrollTop() > top;

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

    this._promiseForNextArticle(slug).then((data) => {
      this.$newArticle = $(this.template(data))
        .appendTo(".page-container")
        .addClass("is-loading");

      // Set the new article element and data to the articles map
      this.articles.set(this.$newArticle[0], data.article);

      this._addNewArticlesToArray(data.article.related_articles.articles);
      this._updateNewArticle(data.article);

      this.isNextArticleLoading = false;

      this._hideLoader({showArticle: true});
    }, () => {
      this.isNextArticleLoading = false;

      this._hideLoader({showArticle: false});
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
  _updateNewArticle(data) {
    this.articleBody = new ArticleBodyComponent({
      el: this.$newArticle.find(".article-body"),
      poiData: data.content.callouts
    });

    this.actionSheet = new ActionSheetComponent({
      el: this.$newArticle.find(".js-action-sheet")
    });

    this.howManyArticlesHaveLoaded += 1;

    this._setNextArticle();
    this._setArticlePagination(2);
    this._createArticlePagination(this.$newArticle);
    this._updateAd();
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
  _updateData() {
    let article = this.articles.get(this.$activeArticle[0]),
        interests = article.tealium.article.interests,
        categories = [],
        regex = /,\s*$/;

    window.lp.article = {
      name: article.title,
      slug: article.slug,
      image: article.image,
      postDate: article.post_date,
      author: article.author_details.name,
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

  /**
   * Generate unique names for slots
   * @return {String} Unique ID
   */
  _generateNextSlotName() {
    let id = this.nextSlotId++;
    return `adunit-${id}`;
  }

  /**
   * Define a size mapping object. The first parameter to addSize is a viewport
   * size, while the second is a list of allowed ad sizes.
   * @return {Object} Size map
   */
  _adSizes() {
    return googletag.sizeMapping()
      .addSize([980, 0], [[970, 250], [940, 40], [728, 90]])
      .addSize([728, 0], [[728, 90]])
      .addSize([0, 0], [[300, 250], [300, 50]])
      .build();
  }

  @track("article ad impression load");
  _loadFirstAd() {
    let adSlots = [];
    let $adUnit = $("#adunit-0");

    $adUnit.data("sizeMapping", this.$window.width() >= 728 ? "leaderboard" : "mpu");

    googletag.cmd.push(() => {
      // Declare any slots initially present on the page
      adSlots[0] = googletag.defineSlot(this.adPath, [300, 250], "adunit-0")
        .defineSizeMapping(this._adSizes())
        .setTargeting("template", window.lp.ads.template)
        .setTargeting("topic", window.lp.ads.topic)
        .setTargeting("adThm", window.lp.ads.adThm)
        .setTargeting("continent", window.lp.ads.continent)
        .setTargeting("country", window.lp.ads.country)
        .setTargeting("destination", window.lp.ads.destination)
        .setCollapseEmptyDiv(true)
        .addService(googletag.pubads());

      // Infinite scroll requires SRA
      googletag.pubads().enableSingleRequest();

      // Disable initial load, we will use `refresh()` to fetch ads. Calling
      // this function means that `display()` calls just register the slot as
      // ready, but do not fetch ads for it.
      googletag.pubads().disableInitialLoad();

      googletag.enableServices();
    });

    // Call `display()` to register the slot as ready and `refresh()` to fetch
    // an ad
    googletag.cmd.push(() => {
      googletag.display("adunit-0");
      googletag.pubads().refresh([adSlots[0]]);
    });

    if ($adUnit.length) {
      return `${$adUnit.data().sizeMapping}-${$adUnit[0].id}-default`;
    }
  }

  @track("article ad impression scroll");
  _updateAd() {
    let slotName = this._generateNextSlotName();
    let $slot = $("<div />", {
      "id": slotName,
      "class": "adunit adunit--leaderboard",
      "attr": {
        "data-size-mapping": "leaderboard",
        "data-targeting": ""
      }
    });

    $slot.appendTo(this.$newArticle.find(".ad--leaderboard__container"));

    // Define the slot itself; call `display()` to register the div and
    // `refresh()` to fetch ad
    googletag.cmd.push(() => {
      let slot = googletag.defineSlot(this.adPath, [300, 250], slotName)
        .defineSizeMapping(this._adSizes())
        .setTargeting("template", window.lp.ads.template)
        .setTargeting("topic", window.lp.ads.topic)
        .setTargeting("adThm", window.lp.ads.adThm)
        .setTargeting("continent", window.lp.ads.continent)
        .setTargeting("country", window.lp.ads.country)
        .setTargeting("destination", window.lp.ads.destination)
        .setCollapseEmptyDiv(true)
        .addService(googletag.pubads());

      // `display()` has to be called before `refresh()` and after the slot
      // `div` is in the page
      googletag.display(slotName);
      googletag.pubads().refresh([slot]);
    });

    if ($slot.length) {
      return `${$slot.data().sizeMapping}-${$slot[0].id}-ajax`;
    }
  }
}
