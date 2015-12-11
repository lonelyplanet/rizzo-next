/* global googletag, utag */
import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/function/debounce";
import ArticleBodyComponent from "../article_body";
import track from "../../core/decorators/track";

export default class ArticleComponent extends Component {
  initialize() {
    this.canUseScrollFeature = window.history && window.history.pushState;

    this._resetWindowScrollPosition();

    this.$window = $(window);

    this.windowScrollTop = this.$window.scrollTop();
    this.articleOffsetTop = this.$el.offset().top;
    this.articleHeight = this.$el.height();
    this.articleScrollTop = this.articleHeight;
    this.heightOfAllArticles = 0;
    this.isNextArticleLoading = false;

    this.template = require("./article.hbs");
    this.loader = require("./article-loading.hbs");

    this.articles = new Map();
    this.viewedArticles = [];
    this.listOfArticles = [];
    this.paginatedArticles = {};

    this.delay = 1500;

    this.nextSlotId = 1;

    this._slugifyPlaceData();

    window.lp.ads = {
      adThm: `tip-article, ${window.lp.article.id}`,
      continent: window.lp.article.continentName,
      country: window.lp.article.countryName,
      destination: window.lp.article.destination,
      interest: window.lp.article.interests.replace(/,\s*$/, ""),
      layers: ["2009.lonelyplanet"],
      networkId: 9885583,
      template: "tips-and-articles-detail",
      topic: "tips-and-articles"
    };

    this._updateAdLayers({
      section: window.lp.article.siteSection,
      continent: window.lp.article.continentName,
      country: window.lp.article.countryName,
      city: window.lp.article.cityName,
      destination: window.lp.article.destination
    });

    this._updateAdPath(window.lp.ads.layers);

    this._updateValuesAfterTimeout();
    this._setFirstArticle();
    this._createInitialListOfArticles();
    this._loadFirstAd();
  }

  _slugifyPlaceData() {
    window.lp.article.cityName = this._slugify(window.lp.article.cityName);
    window.lp.article.continentName = this._slugify(window.lp.article.continentName);
    window.lp.article.countryName = this._slugify(window.lp.article.countryName);
    window.lp.article.destination = this._slugify(window.lp.article.destination);
    window.lp.article.interests = window.lp.article.interests.replace(/,\s*$/, "");
  }

  _updateAdPath(layers) {
    this.adPath = `/${window.lp.ads.networkId}/${layers.join("/")}`;
  }

  /**
   * Checks each layer and updates the layers array accordingly; currently a
   * mess, but for now, it works.
   * @param {Object} layers Layers to push to the array
   */
  _updateAdLayers(layers) {
    window.lp.ads.layers = ["2009.lonelyplanet"];

    if (layers.section) {
      window.lp.ads.layers.push(layers.section);

      if (layers.continent) {
        window.lp.ads.layers.push(layers.continent);

        if (layers.country) {
          window.lp.ads.layers.push(layers.country);

          if (layers.city) {
            window.lp.ads.layers.push(layers.city);
          }
        } else {
          window.lp.ads.layers.push(layers.destination);
        }
      } else {
        window.lp.ads.layers.push("the-world");
      }
    }
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
      title: this.$activeArticle.data("title"),
      slug: this.$activeArticle.data("slug"),
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
      this._setInitialListOfArticles(response);
    });
  }

  _setInitialListOfArticles(response) {
    this.listOfArticles = response;
    this.windowScrollTop = this.$window.scrollTop();
    this._setNextArticle();
    this._setArticlePagination(1);
    this._createArticlePagination(this.$el);

    if (this.canUseScrollFeature) {
      this._scrollToNextArticle();
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

      this._checkIfHistoryShouldBeUpdated();
    }, 10));
  }

  /**
   * Check scroll top against each value in the map and add or remove the active
   * class to the `$article` element
   * @param  {Object} article The article object from the map
   */
  _toggleActiveClassForArticle(article) {
    if (this.windowScrollTop) {
      let top = article.offsetTop,
          bottom = top + article.offsetHeight,
          shouldActiveClassBeAdded = this.windowScrollTop < bottom && this.windowScrollTop > top;

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

    $(this.loader({}))
      .appendTo(this.$activeArticle);

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
      },
      error: () => {
        this.isNextArticleLoading = false;
      }
    });
  }

  /**
   * Updates a newly created article
   */
  _updateNewArticle() {
    this.articleBody = new ArticleBodyComponent({ el: this.$newArticle });

    // Set the scrollTop for the new article; this will not be accurate because
    // the article has not fully loaded (due to fonts and images), therefore,
    // the scrollTop will be set again inside of a timeout that's in the reset
    // method. Even though it's incorrect, the scrollTop needs to be set here
    // intially so that the new article's scrollTop is greater than the
    // previous.
    this.articleScrollTop = this.articleHeight + this.$newArticle.height();

    this.articleOffsetTop = this.$newArticle.offset().top;

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
    if (pathname !== `/${slug}`) {
      history.pushState(null, title, `/${slug}`);

      this._updateData();

      if(!this._doesItemExist(this.viewedArticles, slug)) {
        this._trackEvent(`/${slug}`);
        this._updateListOfViewedArticles();
      }
    }
  }

  /**
   * Track event for analytics
   * @param {String} pathname Pathname to send to analytics
   */
  _trackEvent(pathname) {
    utag.view({
      ga_location_override: pathname
    });
    // window.lp.analytics.api.trackEvent({
    //   category: "page view",
    //   action: "location override",
    //   location: pathname
    // });
  }

  /**
   * Update data and track events for analytics
   */
  _updateData() {
    let article = this.articles.get(this.$activeArticle[0]);

    window.lp.article = {
      name: article.title,
      slug: article.slug,
      atlasId: article.tealium.article.atlas_id,
      continentName: article.tealium.article.cd1_Continent ? this._slugify(article.tealium.article.cd1_Continent) : "",
      countryName: article.tealium.article.cd2_Country ? this._slugify(article.tealium.article.cd2_Country) : "",
      cityName: article.tealium.article.cd3_City ? this._slugify(article.tealium.article.cd3_City) : "",
      type: article.tealium.article.page_type,
      siteSection: article.tealium.article.site_section,
      interests: article.tealium.article.interests.join(", ").replace(/,\s*$/, ""),
      id: article.tealium.place.id,
      destination: this._slugify(article.tealium.place.destination)
    };

    window.lp.ads.adThm = `tip-article, ${window.lp.article.id}`;
    window.lp.ads.continent = window.lp.article.continentName;
    window.lp.ads.country = window.lp.article.countryName;
    window.lp.ads.destination = window.lp.article.destination;
    window.lp.ads.interest = window.lp.article.interests.replace(/,\s*$/, "");

    this._updateAdLayers({
      section: window.lp.article.siteSection,
      continent: window.lp.article.continentName,
      country: window.lp.article.countryName,
      city: window.lp.article.cityName
    });

    this._updateAdPath(window.lp.ads.layers);
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
      .addSize([0, 0], [[300, 250]])
      .build();
  }

  @track("ad page load impression");
  _loadFirstAd() {
    let adSlots = [];
    let $adUnit = $("#adunit-0");

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
      return `${$adUnit.data().sizeMapping}, ${this.$el.data().slug}, ${$adUnit[0].id}`;
    }
  }

  @track("ad ajax load impression");
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
        .addService(googletag.pubads());

      // `display()` has to be called before `refresh()` and after the slot
      // `div` is in the page
      googletag.display(slotName);
      googletag.pubads().refresh([slot]);
    });

    if ($slot.length) {
      return `${$slot.data().sizeMapping}, ${this.$newArticle.data().slug}, ${$slot[0].id}`;
    }
  }
}
