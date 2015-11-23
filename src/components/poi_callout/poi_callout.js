import { Component } from "../../core/bane";
import $ from "jquery";
import $clamp from "clamp-js/clamp.js";
import debounce from "lodash/function/debounce";

export default class PoiCalloutComponent extends Component {
  /**
   * Render the POI callout
   * @return {jQuery} Returns the poi-callout element
   */
  // get $poi() {
  //   if (this._$poi) {
  //     return this._$poi;
  //   }

  //   return this._$poi = $(this.template({})).appendTo("body");
  // }

  initialize(options, {
    poiLinkSelector = "a[data-poi-slug]"
  } = {}) {
    this.template = require("./poi_callout.hbs");

    this.$links = this.$el.find(poiLinkSelector);

    this.poiLinkSelector = poiLinkSelector;

    this.pois = options.pois;

    this.events = {
      ["mouseenter " + poiLinkSelector]: "_createPoiCallout",
      ["mouseleave " + poiLinkSelector]: "_destroyPoiCallout"
    };

    // Append template
    $(this.template({})).appendTo("body");

    // Cache jQuery objects
    this.$window = $(window);
    this.$callout = $(".poi-callout");

    // Set variables
    this.calloutWidth = this.$callout.outerWidth();
    this.left = this.$el.offset().left - this.calloutWidth - 35;
    this.top = 0;
    this.articleOffsetHeight = this.$el.height() + this.$el.offset().top;
    this.mouseoutTimeout;
    this.$activeLink;

    this.$window.resize(debounce(() => {
      this.left = (this.$window.width() >= 1370)
        ? this.$el.offset().left - this.calloutWidth - 35
        : this.$el.offset().left - this.calloutWidth;

      this._windowEvents();
    }, 10));

    this.$window.scroll(debounce(() => {
      this._windowEvents();
    }, 10));

    this.$callout.on("mouseenter", () => {
      clearTimeout(this.mouseoutTimeout);
    }).on("mouseleave", (event) => {
      this._destroyPoiCallout(event);
    });
  }

  /**
   * Resets and detaches callout, removes all event handlers
   */
  destroy() {
    this._resetPoiCallout();
    this.$callout.detach();
    this.$el.off("mouseenter mouseleave");
    this.$callout.off("mouseenter mouseleave");
    this.$window.off("resize scroll");
  }

  /**
   * Creates the POI callout and positions it
   * @param  {Object} event
   * @return false
   */
  _createPoiCallout(event) {
    event.preventDefault();

    if (!this.$callout.hasClass("is-visible")) {
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
        .removeClass("is-visible");
    }, 1000);

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
      .closest("p")
      .siblings()
      .find(this.poiLinkSelector)
      .removeClass("is-active");
  }

  /**
   * Updates the callout content, makes it visible and positions it
   */
  _updatePoiCallout() {
    let poiData = this.pois[this.$activeLink.data("poiSlug")];
    let image, src;

    if (poiData.image) {
      // TODO: Do this on the Ruby side
      image = poiData.image.replace("http://media.lonelyplanet.com/", "");
      src = `https://lonelyplanetimages.imgix.net/${image}?w=210&h=95&fit=crop`;
    } else {
      src = "";
    }

    this.$callout
      .addClass("is-visible")
      .attr({
        "aria-hidden": "false",
        "href": this.$activeLink.attr("href")
      })
      .css({
        "top": `${this.top}px`,
        "left": `${this.left}px`
      })
      .find("h3").html(poiData.name).end()
      .find("h5").html(poiData.topic).end()
      .find("p").html(poiData.excerpt).end()
      .find("img").attr("src", src);

    $clamp(this.$callout.find("p").get(0), { clamp: 3 });
  }

  /**
   * Returns the callout to its "default" state
   */
  _resetPoiCallout() {
    this.top = 0;

    this.$callout
      .attr("aria-hidden", "true")
      .removeClass("is-visible")
      .removeAttr("style");
  }

  /**
   * Sets the top offset of the callout
   */
  _setTopOffsetForPoiCallout() {
    let bottomOffset = this.$callout.height() + this.$activeLink.offset().top,
        topOffset = this.$activeLink.offset().top,
        calloutPosition = topOffset - this.$window.scrollTop() + this.$callout.outerHeight() + 30;

    let isCalloutBelowBottom = this.articleOffsetHeight - bottomOffset < 0,
        isCalloutOffscreen = calloutPosition > this.$window.height();

    this.$window.scroll(debounce(() => {
      calloutPosition = topOffset - this.$window.scrollTop() + this.$callout.outerHeight() + 30;
    }, 100));

    if (isCalloutBelowBottom) {
      this.top = topOffset + (this.articleOffsetHeight - bottomOffset);

    } else if (isCalloutOffscreen) {
      this.top = topOffset - (calloutPosition - this.$window.height());

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
