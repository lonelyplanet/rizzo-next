import Component from "../../core/component";
import waitForTransition from "../../core/utils/waitForTransition";
import track from "../../core/decorators/track";
import $clamp from "clamp-js/clamp.js";
import rizzo from "../../rizzo";
import publish from "../../core/decorators/publish";

/**
 * Show a list of Top Experiences
 */
class ThingsToDo extends Component {
  initialize() {
    this.currentIndex = (this.getCurrentIndex()) || 0;

    this.options = {
      numOfCards: 4
    };

    this.events = {
      "click .js-ttd-more": "loadMore",
      "click .js-ttd-less": "loadPrevious",
      "swiperight": "loadPrevious",
      "swipeleft": "loadMore"
    };

    this.fetchCards().done(this.cardsFetched.bind(this)).fail((jqXHR) => {
      rizzo.logger.error({ error: jqXHR.responseText });
      return this.nukeIt();
    });

    this.navigation = require("./things_to_do_navigation.hbs");
  }
  getCurrentIndex() {
    let obj = window.localStorage && JSON.parse(window.localStorage.getItem("ttd.currentIndex"));
    if (!obj || obj.slug !== window.lp.place.slug) {
      return;
    }

    return obj.index;
  }
  fetchCards() {
    return $.ajax({
      url: `/api/${window.lp.place.slug}/experiences`
    });
  }
  @publish("experiences.removed")
  nukeIt() {
    $("#experiences").remove();
  }
  // TODO: jc this is... smelly
  cardsFetched(cards) {
    if (!cards.length) {
      return this.nukeIt();
    }
    this.cards = cards;

    if (cards.length > 4) {
      this.addNavigationButtons();
    }
    if (this.currentIndex >= this.options.numOfCards)  {
      this.showPrevious();
    }
    if (this.currentIndex + 4 >= this.cards.length) {
      this.hideShowMore();
    }

    this.template = require("./thing_to_do_card.hbs");
    this.render(this.nextCards());

    this.clampImageCardTitle();
  }
  addNavigationButtons() {
    this.$el.find(".js-ttd-navigation").html(this.navigation());
  }
  /**
   * Get the next 4 cards to render
   * @return {Array} An array of rendered templates
   */
  nextCards() {
    if (this.currentIndex >= this.cards.length) {
      this.currentIndex = 0;
    } else if (this.currentIndex < 0) {
      this.currentIndex = this.cards.length - ((this.cards.length % this.options.numOfCards) || this.options.numOfCards);
    }

    return this.cards.slice(this.currentIndex, this.currentIndex + this.options.numOfCards)
      .map((card, i) => {
        Object.assign(card.card, {
          card_num: i + this.currentIndex + 1,
          order: i
        });
        return this.template(card);
      });
  }

  render(cards) {
    this.$el.find(".js-ttd-list").html(cards.join(""));

    this.loadImages(this.$el.find(".js-image-card-image"));
  }

  loadImages(images) {
    let imagePromises = [];

    images.each((index, element) => {
      let $el = $(element),
          imageUrl = $el.data("image-url"),
          backupUrl = $el.data("backupimage-url");

      imagePromises.push(this.lazyLoadImage(imageUrl)
        .then(undefined, () => {
          return this.lazyLoadImage(backupUrl);
        })
        .then((url) => {
          $el.css({
              "background-image": "url(" + url + ")"
            })
            .addClass("is-visible");
        }));
    });

    return Promise.all(imagePromises);
  }
  makeNextList() {
    let cards = this.nextCards();
    if (window.localStorage) {
      window.localStorage.setItem("ttd.currentIndex", JSON.stringify({ index: this.currentIndex, slug: window.lp.place.slug }));
    }

    // Create a new list and place it on top of existing list
    return $("<ul />", {
        "class": "ttd__list js-ttd-list"
      })
      .append(cards);
  }
  animate(reverse=false) {
    let $list = this.$el.find(".js-ttd-list"),
        ttdComponentWidth = this.$el.width();

    let $nextList = this.makeNextList();

    $nextList.css({
      "margin-top": `-${$list.outerHeight(true)}px`,
      "transform": `translate3d(${reverse ? "-" : ""}${ttdComponentWidth}px, 0, 0)`
    });
    this.loadImages($nextList.find(".js-image-card-image"));

    this.animating = true;

    $list.after($nextList)
      .css("transform", `translate3d(${reverse ? "" : "-"}${ttdComponentWidth}px, 0, 0)`);

    setTimeout(() => {
      $nextList
        .css("transform", "translate3d(0, 0, 0)");
    }, 30);

    if (!reverse && this.currentIndex + 4 >= this.cards.length) {
      this.hideShowMore();
    } else if (reverse && this.currentIndex - 4 < 0) {
      this.hideShowPrevious();
    }

    return waitForTransition($nextList, { fallbackTime: 600 })
      .then(() => {
        $list.remove();
        $nextList.css("margin-top", 0);
        this.animating = false;
      });
  }
  /**
   * Load more top things to do. Callback from click on load more button.
   * @param  {jQuery.Event} e The DOM event
   */
  @track("Top Experiences More")
  loadMore(e) {
    e.preventDefault();
    if (this.animating || this.currentIndex + 4 >= this.cards.length) {
      return;
    }
    // Grab the next 4 images
    this.showMoreAndPrevious();
    this.currentIndex += this.options.numOfCards;

    // Forward
    this.animate();
  }
  @track("Top Experiences Previous")
  loadPrevious(e) {
    e.preventDefault();
    if (this.animating || this.currentIndex - 4 < 0) {
      return;
    }
    // Grab the next 4 images
    this.showMoreAndPrevious();
    this.currentIndex -= this.options.numOfCards;

    // Reverse
    this.animate(true);
  }
  showMore() {
    this.$el.find(".js-ttd-more").prop("disabled", false);
  }
  showPrevious() {
    this.$el.find(".js-ttd-less").prop("disabled", false);
  }
  showMoreAndPrevious() {
    this.showMore();
    this.showPrevious();
  }
  hideShowMore() {
    this.$el.find(".js-ttd-more").prop("disabled", true);
  }
  hideShowPrevious() {
    this.$el.find(".js-ttd-less").prop("disabled", true);
  }

  /**
   * Lazy load an image
   * @param  {String} url Image url to lazy load
   * @return {Promise} A promise that resolves when the image has loaded
   */
  lazyLoadImage(url) {
    let self = this,
        image = new Image();

    this.imagePromises = this.imagePromises || {};

    if (this.imagePromises[url]) {
      return this.imagePromises[url];
    }

    let promise = new Promise((resolve, reject) => {
      image.src = url;
      image.onload = function() {
        // Only cache the promise when it's successfully loading an image
        self.imagePromises[url] = promise;
        resolve(url);
      };
      image.onerror = function() {
        reject();
      };

      if (!url) {
        reject();
      }
    });

    return promise;
  }

  /**
   * Clamp a card title
   * @return null
   */
  clampImageCardTitle() {
    $.each($(".js-image-card-title"), function() {
      $clamp($(this).get(0), { clamp: 2 });
    });
  }
}

export default ThingsToDo;
