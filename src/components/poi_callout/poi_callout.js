import { Component } from "../../core/bane";
import $ from "jquery";
import debounce from "lodash/debounce";

export default class PoiCalloutComponent extends Component {
  initialize(options, {
    poiLinkSelector = "a[data-callout-slug]"
  } = {}) {
    this.contentTemplate = require("./poi_callout_content.hbs");
    this.calloutTemplate = require("./poi_callout.hbs");

    this.$links = this.$el.find(poiLinkSelector);

    this.poiLinkSelector = poiLinkSelector;

    this.pois = options.pois;

    this.events = {
      ["mouseenter.poi " + poiLinkSelector]: "_createPoiCallout",
      ["mouseleave.poi " + poiLinkSelector]: "_destroyPoiCallout"
    };

    this.$callout = $(this.calloutTemplate({})).appendTo("body");

    this.$callout.html(this.contentTemplate({}));

    this.$window = $(window);
    this.calloutWidth = this.$callout.outerWidth();
    this.left = this.$el.offset().left - this.calloutWidth - 35;
    this.top = 0;
    this.articleOffsetHeight = this.$el.height() + this.$el.offset().top;
    this.mouseoutTimeout;
    this.$activeLink;

    let updateArticleOffsetHeight = false;

    this.$window.on("resize.poi", debounce(() => {
      this.left = (this.$window.width() >= 1370)
        ? this.$el.offset().left - this.calloutWidth - 35
        : this.$el.offset().left - this.calloutWidth;

      this._windowEvents();
    }, 100));

    this.$window.on("scroll.poi", debounce(() => {
      this._windowEvents();

      if (!updateArticleOffsetHeight) {
        updateArticleOffsetHeight = true;
        this.articleOffsetHeight = this.$el.height() + this.$el.offset().top;
      }
    }, 100));

    this.$callout.on("mouseenter.poi", () => {
      clearTimeout(this.mouseoutTimeout);
    }).on("mouseleave.poi", (event) => {
      this._destroyPoiCallout(event);
    });
  }

  /**
   * Resets and detaches callout, removes all event handlers
   */
  destroy() {
    this._resetPoiCallout();
    this.$callout.detach();
    this.$el.off("mouseenter.poi mouseleave.poi");
    this.$callout.off("mouseenter.poi mouseleave.poi");
    this.$window.off("resize.poi scroll.poi");
  }

  /**
   * Creates the POI callout and positions it
   * @param  {Object} event
   * @return false
   */
  _createPoiCallout(event) {
    event.preventDefault();

    if (this.$callout.hasClass("is-invisible")) {
      this.top = 0;
      this.$callout.removeAttr("style");
    }

    this.$activeLink = $(event.currentTarget);

    this.$activeLink
      .addClass("is-active");

    this._resetSiblingLinks();
    this._setTopOffsetForPoiCallout();
    this._updatePoiCallout();

    clearTimeout(this.mouseoutTimeout);

    return false;
  }

  /**
   * Hides the POI callout
   * @param  {Object} event
   * @return false
   */
  _destroyPoiCallout(event) {
    event.preventDefault();

    this.mouseoutTimeout = setTimeout(() => {
      this.$activeLink
        .removeClass("is-active");

      this.$callout
        .attr("aria-hidden", "true")
        .removeClass("is-visible")
        .addClass("is-invisible");
    }, 250);

    return false;
  }

  /**
   * Removes the active class from sibling links
   */
  _resetSiblingLinks() {
    // Remove the active class from siblings in the same paragraph
    this.$activeLink
      .siblings(this.poiLinkSelector)
      .removeClass("is-active");

    // Remove the active class from siblings in different paragraphs
    this.$activeLink
      .closest(".lp-js-poi-callout-excerpt")
      .siblings()
      .find(this.poiLinkSelector)
      .removeClass("is-active");
  }

  /**
   * Updates the callout content, makes it visible and positions it
   */
  _updatePoiCallout() {
    let poiData = this.pois[this.$activeLink.data("calloutSlug")];

    this.$callout
      .addClass("is-visible")
      .removeClass("is-invisible")
      .attr({
        "aria-hidden": "false",
        "href": this.$activeLink.attr("href")
      })
      .css({
        "top": `${this.top}px`,
        "left": `${this.left}px`
      })
      .html(this.contentTemplate({
        name: poiData.name,
        topic: poiData.topic,
        excerpt: poiData.excerpt,
        image: poiData.image
      }));
  }

  /**
   * Returns the callout to its "default" state
   */
  _resetPoiCallout() {
    this.top = 0;

    this.$callout
      .attr("aria-hidden", "true")
      .removeClass("is-visible")
      .addClass("is-invisible")
      .removeAttr("style");
  }

  /**
   * Sets the top offset of the callout
   */
  _setTopOffsetForPoiCallout() {
    let bottomOffset = this.$callout.height() + this.$activeLink.offset().top,
        topOffset = this.$activeLink.offset().top,
        calloutPosition = topOffset - this.$window.scrollTop() + this.$callout.outerHeight() + 30,
        stickyFooterOffset = 76;

    let isCalloutBelowBottom = this.articleOffsetHeight - bottomOffset < 0,
        isCalloutOffscreen = calloutPosition > this.$window.height();

    this.$window.scroll(debounce(() => {
      calloutPosition = topOffset - this.$window.scrollTop() + this.$callout.outerHeight() + 30;
    }, 100));

    if (isCalloutBelowBottom) {
      this.top = topOffset + (this.articleOffsetHeight - bottomOffset) - stickyFooterOffset;

    } else if (isCalloutOffscreen) {
      this.top = topOffset - (calloutPosition - this.$window.height()) - stickyFooterOffset;

    } else {
      this.top = topOffset;

    }
  }

  /**
   * Methods for window events, such as resize and scroll
   */
  _windowEvents() {
    if (typeof this.$activeLink !== "undefined") {
      this.$activeLink
        .removeClass("is-active");

      this._resetPoiCallout();
    }
  }
}
