import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/debounce";
import waitForTransition from "../../core/utils/waitForTransition";
import subscribe from "../../core/decorators/subscribe";
import ProgressComponent from "../progress";

class StickyFooterComponent extends Component {
  initialize(options) {
    this.options = options;
    this.articleOffsetTop = this.options.articleOffsetTop;
    this.amountNeededToScroll = this.options.amountNeededToScroll;
    this.state = this.options.state;

    this.$document = $(document);
    this.$window = $(window);
    this.$progress = this.$el.find(".js-lp-progress");

    this.transitionSpeed = 400;
    this.scrollEventName = "scroll.stickyFooter";
    this.offScreenClassName = "off-screen";
    this.currentItem = ".js-lp-sticky-footer-current-item";
    this.nextItem = ".js-lp-sticky-footer-next-item";
    this.nextItemClicked = false;
    this.lastScrollTop = 0;
    this.isHidden = true;

    this.events = {
      ["click " + this.nextItem]: "_goToNextItem"
    };

    this.progressComponent = new ProgressComponent({
      el: this.$progress,
      width: 0
    });

    this.subscribe();
  }

  scroll() {
    this.$window.on(this.scrollEventName, debounce(() => {
      this.scrollDirection = (this.$window.scrollTop() > this.lastScrollTop) ? "down" : "up";
      this.lastScrollTop = this.$window.scrollTop();

      if (this.$window.scrollTop() >= this.amountNeededToScroll) {
        if (this.scrollDirection === "down") {
          this.progressComponent.fill();
        }

        if (!this.isHidden) {
          this.hide();
        }

        return waitForTransition(this.$el, { fallbackTime: this.transitionSpeed }).then(() => {
          this.progressComponent.reset();
        });
      } else if (this.$window.scrollTop() >= this.articleOffsetTop) {
        if (this.isHidden) {
          this.show();
        }
      } else {
        if (!this.isHidden) {
          this.hide();
        }
      }

      this.progressComponent.update((this.$window.scrollTop() - this.articleOffsetTop) / (this.amountNeededToScroll - this.articleOffsetTop) * 100);
    }, 10));
  }

  update(articleOffsetTop, amountNeededToScroll, state) {
    this.articleOffsetTop = articleOffsetTop;
    this.amountNeededToScroll = amountNeededToScroll;
    this.state = state;

    if (this.scrollDirection === "up") {
      return waitForTransition(this.$el, { fallbackTime: this.transitionSpeed }).then(() => {
        this.progressComponent.fill();
        this._setContent(state);
      });
    }

    this._setContent(state);
  }

  recalculate(amountNeededToScroll) {
    this.amountNeededToScroll = amountNeededToScroll;
  }

  show() {
    this.isHidden = false;

    this.$el.removeClass(this.offScreenClassName);
  }

  hide() {
    this.isHidden = true;

    this.$el.addClass(this.offScreenClassName);
  }

  detach() {
    this.$el.detach();
    this.$window.off(this.scrollEventName);
  }

  attach() {
    this.$el.appendTo("body");
  }

  _setContent(state) {
    this.nextTitle = state.next.title;
    this.nextSlug = state.next.slug;
    this.nextId = this.nextSlug.split("/")[this.nextSlug.split("/").length - 1];

    this.$el.find(this.currentItem)
      .html(state.current.title);

    this.$el.find(this.nextItem)
      .html(this.nextTitle)
      .attr({
        "href": `/${this.nextSlug}`,
        "data-article-id": this.nextId
      });
  }

  _goToNextItem(event) {
    event.preventDefault();

    if ($(`#${this.nextId}`).length) {
      this.$window.scrollTop($(`#${this.nextId}`).offset().top + 1);
    } else {
      this.nextItemClicked = true;
      this.$window.scrollTop(this.$document.height());
    }
  }

  @subscribe("loaded", "articles")
  _scrollToNextItem(data) {
    if (this.nextItemClicked) {
      this.$window.scrollTop($("#" + data.id).offset().top - 120);
      this.nextItemClicked = false;
    }
  }
}

export default StickyFooterComponent;
