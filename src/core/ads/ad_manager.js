import $ from "jquery";
import AdSizes from "./ad_sizes";
import AdUnit from "./ad_unit";
import CookieUtil from "../cookie_util";
import "jquery.dfp";

export default class AdManager {
  constructor(config) {
    this.defaultConfig = {
      adunits: ".adunit",
      listener: ".page-container",
      sizeMapping: AdSizes,

      // Ad targeting properties
      layers: [ "2009.lonelyplanet" ],
      theme: "",
      template: "",
      topic: "",

      // Deprecated targeting properties
      adThm: "",
      adTnm: "",
      continent: "",
      country: "",
      destination: ""
    };

    this.config = $.extend({}, this.defaultConfig, config);
    this.$listener = $(document);
    return this;
  }

  initialize() {
    this.pluginConfig = {
      dfpID: this.getNetworkID(),
      setTargeting: this.formatKeywords(this.config),
      namespace: this.config.layers.join("/"),
      sizeMapping: this.config.sizeMapping,
      collapseEmptyDivs: true,
      enableSingleRequest: false,
      afterEachAdLoaded: ($adunit) => {
        this._adCallback.call(this, $adunit);
      }
    };

    this.load();

    this.$listener.on(":ads/refresh :page/updated", (e, data) => {
      this.refresh(data);
    });

    this.$listener.on(":ads/reload :page/changed :lightbox/contentReady", () => {
      this.pluginConfig.setTargeting = this.formatKeywords(window.lp.ads);
      this.load();
    });
  }

  _adCallback($adunit) {
    let unit = $adunit.data("adUnit"),
        currentUnit;

    if ($adunit.closest(".row--sponsored").length) {
      $(".row--sponsored").addClass("is-open");
    }

    if (!unit) {
      currentUnit = new AdUnit($adunit);
      $adunit.data("adUnit", currentUnit);
    }

    if (!currentUnit.isEmpty()) {
      window.lp.analytics.api.trackEvent({
        category: "advertising",
        action: "page-load-impression",
        label: $adunit.data().sizeMapping
      });
    }
  }

  formatKeywords(config) {
    let keywords = {
      theme: config.theme,
      template: config.template,
      topic: config.topic,

      // Deprecated targeting properties
      thm: config.adThm,
      ctt: config.continent,
      cnty: config.country,
      dest: config.destination
    };

    if (window.Krux) {
      keywords.ksg = window.Krux.segments || "";
      keywords.kuid = window.Krux.user || "";
    }

    if (config.adTnm) {
      keywords.tnm = config.adTnm.replace(/\s/, "").split(",");
    }

    if (config.keyValues && !$.isEmptyObject(config.keyValues)) {
      for (let key in config.keyValues) {
        if (config.keyValues.hasOwnProperty(key)) {
          keywords[key] = config.keyValues[key];
        }
      }
    }

    return keywords;
  }

  getNetworkID() {
    let networkID = 9885583,
        cookie = this._networkCookie(),
        param = this._networkParam();

    if (param) {
      networkID = param;
    } else if (cookie) {
      networkID = cookie;
    }

    return networkID;
  }

  _networkCookie() {
    return new CookieUtil().getCookie("lpNetworkCode");
  }

  _networkParam() {
    let props = window.location.search.match(/lpNetworkCode=([0-9]{4,8})/);
    return props ? props.pop() : null;
  }

  load() {
    this.$adunits = $(this.config.adunits);

    // Filter out ad units that have already been loaded then
    // ad dimensions that may be too large for their context
    this.$adunits
      .filter((index) => {
        return this.$adunits.eq(index).data("googleAdUnit") === undefined;
      })
      .dfp(this.pluginConfig);
  }

  refresh(data) {
    let i, len, unit;

    if (!data) {
      return window.googletag.pubads().refresh();
    }

    for (i = 0, len = this.$adunits.length; i < len; i++) {
      if (unit = this.$adunits.eq(i).data("adUnit")) {
        if (!data.type || data.type === unit.getType()) {
          unit.refresh(data.ads);
        }
      }
    }
  }
}
