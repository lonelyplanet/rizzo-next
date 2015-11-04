import Component from "../../core/component";
import assign from "lodash/object/assign";
import waitForTransition from "../../core/utils/waitForTransition";
import publish from "../../core/decorators/publish";
import $clamp from "clamp-js/clamp.js";

class ThingsToDo extends Component {
  initialize() {
    this.currentIndex = 0;

    this.options = {
      numOfCards: 4
    };

    let { cards } = this.getInitialState();

    // Exit in case there were no experiences
    if (!cards) {
      return;
    }

    if (cards.length > 4) {
      this.$el.find(".js-ttd-list-container").addClass("has-more");
    }

    this.cards = cards;

    this.events = {
      "click .js-ttd-more": "loadMore"
    };

    this.template = require("./thing_to_do_card.hbs");
    this.render(this.nextCards());

    this.clampImageCardTitle();
  }

  /**
   * Get the next 4 cards to render
   * @return {Array} An array of rendered templates
   */
  nextCards() {
    if (this.currentIndex >= this.cards.length) {
      this.currentIndex = 0;
    }

    return this.cards.slice(this.currentIndex, this.currentIndex + this.options.numOfCards)
      .map((card, i) => this.template(assign(card, {
          card_num: i + this.currentIndex + 1,
          order: i
        })));
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

  /**
   * Load more top things to do. Callback from click on load more button.
   * @param  {jQuery.Event} e The DOM event
   */
  @publish("ttd.loadmore");
  loadMore(e) {
    let $list = this.$el.find(".js-ttd-list"),
        ttdComponentWidth = this.$el.width();

    e.preventDefault();
    if (this.animating) {
      return;
    }

    // Grab the next 4 images
    this.currentIndex += this.options.numOfCards;
    let cards = this.nextCards();

    // Create a new list and place it on top of existing list
    let $nextList = $("<ul />", {
        "class": "ttd__list js-ttd-list"
      })
      .css({
        "margin-top": `-${$list.outerHeight(true)}px`,
        "transform": `translate3d(${ttdComponentWidth}px, 0, 0)`
      })
      .append(cards);

    this.animating = true;

    this.loadImages($nextList.find(".js-image-card-image"));
    $list.after($nextList)
      .css("transform", `translate3d(-${ttdComponentWidth}px, 0, 0)`);

    waitForTransition($list, { fallbackTime: 300 })
      .then(() => {
        $nextList
          .css("transform", "translate3d(0, 0, 0)");

        return waitForTransition($nextList, { fallbackTime: 300 });
      })
      .then(() => {
        $list.remove();
        $nextList.css("margin-top", 0);
        this.animating = false;
      });
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
