import { analytics, EventNames, getTrackMethod } from "@lonelyplanet/lp-analytics";
import { Component } from "../../core/bane";
import waitForTimeout from "../../core/utils/waitForTransition";
import Overlay from "../overlay";
import matchMedia from "../../core/utils/matchMedia";
import breakpoints from "../../core/utils/breakpoints";
import SocialShareComponent from "../social_share";

class Modal extends Component {
  initialize(options) {
    this.track = getTrackMethod();
    this.events = {
      "touchend a": "goTo"
    };

    this.$html = $("html");
    this.$body = $("body");
    this.$strapline = $(".ebook__strapline");
    this.$title = $(".ebook__title");
    this.$copy = $(".ebook__copy");
    this.$form = $(".js-sailthru-form");
    this.$success = $(".js-success");
    this.$modalTrigger = $(".js-modal");

    // Remove from dom
    this.$el.detach();

    // New overlay instance
    this.overlay = new Overlay();

    // Events
    this.$modalTrigger.on("click", this.show.bind(this));
    this.$body.on("keyup", this.onKeyup.bind(this));
    this.$el.on("click", "[class*='__close']", this.hide.bind(this));
    this.$el.on("submit", ".js-sailthru-form", this.submit.bind(this));
    this.listenTo(this.overlay, "click", this.hide);

    //fire modal on correct url hash

    if (options.hash === location.hash) {
      $(".js-modal").trigger("click");
    }
  }

  /**
   * Handle touch events on top places
   * @param  {[Event]} e
   */
  goTo(e) {
    let el = $(e.currentTarget),
        link = el.attr("href");

    window.location = link;
  }

  toggle() {
    if(this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if(this.isOpen) {
      return Promise.all([]);
    }
    if(this.$el.parent().length === 0) {
      this.$el.appendTo(document.body);
    }

    this.overlay.show();

    matchMedia(`(max-width: ${breakpoints.max["720"]})`, (query) => {
      if (query.matches) {
        $("html, body").animate({ scrollTop: 0 }, "slow");
      }
    });

    // wait a few ticks so transition triggers
    setTimeout(() => {
      this.$el.addClass("modal--visible");
    }, 10);

    this.isOpen = true;

    let hash = this.$modalTrigger.data("href");
    location.hash = hash;
    this.trackModalPageView();

    $(".js-action-sheet").each(function(){
      new SocialShareComponent({
        el: this
      });
    });
  }

  hide() {
    if(!this.isOpen) {
      return Promise.all([]);
    }

    this.isOpen = false;

    this.overlay.hide();

    this.$el.removeClass("modal--visible");

    waitForTimeout(this.$el)
      .then(() => {
        this.$el.detach();
      });

    location.hash = "";
    this.trackModalPageView(location.href);
  }

  onKeyup(e) {
    // ESC
    if(e.keyCode === 27 && this.isOpen) {
      this.hide();
    }
  }

  handleSubmitSuccess(e) {
    this.$form.addClass("is-hidden");
    this.$strapline.addClass("is-hidden");
    this.$title.addClass("is-hidden");
    this.$copy.addClass("is-hidden");
    this.$success.removeClass("is-hidden");
    const dataLayer = {
      category: e.currentTarget.name,
      action: "newsletter",
      value: "sign up"
    };
    window.lp.analytics.send("event", dataLayer);
    /**
     * From what I can tell this has only been used to offer ebooks
     * after users submit their email address to sign up for our newsletter.
     * Hence the above tracking specific to newsletter subscriptions.
     * An example: https://github.com/lonelyplanet/destinations-next/commit/e5546e752d793fd15dc67d515f3f17da199c51b1#diff-986789ce7bc7e90c1dee9fd68a5e28c9
     * I don't know if it's still in use (the file in the PR above has since been deleted),
     * but just in case, tracking here as well.
     */
    this.track({
      [analytics.eventName]: EventNames.newsletterSubscription,
    });
  }

  submit(e) {
    e.preventDefault();

    let formData = this.$form.serialize();

    if(e.currentTarget.name === "celebrate-rio-2016") {
      formData += "&" + $.param({ "sailthru[vars][LP_TRAVELNEWS_NEWSLETTER]": true });
    }

    $.post(this.$form.attr("action"), formData)
      .done(() => {
        this.handleSubmitSuccess(e);
      })
      .fail((xhr) => {
        if (xhr.status === 409) {
          this.handleSubmitSuccess(e);
        } else {
          console.log("error");
        }
      });
  }

  trackModalPageView() {
    // Used to call a page view here, removing but keeping placeholder...
  }
}

export default Modal;
