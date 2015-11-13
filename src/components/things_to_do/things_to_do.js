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
      this.addNavigationButtons();
    }

    this.cards = cards;

    this.events = {
      "click .js-ttd-more": "loadMore",
      "click .js-ttd-less": "loadPrevious",
      "swiperight": "loadPrevious",
      "swipeleft": "loadMore"
    };

    this.template = require("./thing_to_do_card.hbs");
    this.render(this.nextCards());

    this.clampImageCardTitle();
  }
  addNavigationButtons() {
    let $left = $("<div />", { "class": "has-more--left is-invisible"});
    $left.html(`
    <button class="ttd__less js-ttd-less">
      <i class="ttd__more__icon icon-chevron-left" aria-hidden="true"></i>
    </button>
    `);
    this.$el.find(".js-ttd-list").before($left);

    let $right = $("<div />", { "class": "has-more--right"});
    $right.html(`
    <button class="ttd__more js-ttd-more">
      <i class="ttd__more__icon icon-chevron-right" aria-hidden="true"></i>
    </button>
    `);
    this.$el.find(".js-ttd-list").after($right);
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
  makeNextList() {
    let cards = this.nextCards();

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

    return waitForTransition($nextList, { fallbackTime: 300 })
      .then(() => {
        $list.remove();
        $nextList.css("margin-top", 0);
        this.animating = false;

        if (!reverse && this.currentIndex + 4 >= this.cards.length) {
          this.hideShowMore();
          return;
        } else if (reverse && this.currentIndex - 4 < 0) {
          this.hideShowPrevious();
          return;
        }
      });
  }
  /**
   * Load more top things to do. Callback from click on load more button.
   * @param  {jQuery.Event} e The DOM event
   */
  @publish("ttd.loadmore");
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

    return {
      "direction": "forward"
    };
  }
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

    return {
      "direction": "reverse"
    };
  }
  showMoreAndPrevious() {
    this.$el.find(".has-more--left").removeClass("is-invisible");
    this.$el.find(".has-more--right").removeClass("is-invisible");
    this.$el.find(".js-ttd-more").removeClass("is-invisible");
    this.$el.find(".js-ttd-less").removeClass("is-invisible");

  }
  hideShowMore() {
    this.$el.find(".js-ttd-more").addClass("is-invisible");
    this.$el.find(".has-more--right").addClass("is-invisible");
  }
  hideShowPrevious() {
    this.$el.find(".js-ttd-less").addClass("is-invisible");
    this.$el.find(".has-more--left").addClass("is-invisible");
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
