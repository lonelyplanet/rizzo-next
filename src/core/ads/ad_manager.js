import $ from "jquery";
import AdSizes from "./ad_sizes";
import AdUnit from "./ad_unit";
import CookieUtil from "../cookie_util";
import "jquery.dfp";
import subscribe from "../decorators/subscribe";
import track from "../decorators/track";

export default class AdManager {
  constructor(config) {
    this.defaultConfig = {
      adunits: ".adunit",
      sizeMapping: AdSizes,
      layers: [ "LonelyPlanet.com" ],
      theme: "",
      template: "",
      topic: "",
      adThm: "",
      adTnm: "",
      continent: "",
      country: "",
      destination: "",
      city: ""
    };

    this.config = $.extend({}, this.defaultConfig, config);

    this.adCallbacks = {
      "1x1": "_superzone"
    };

    this.subscribe();

    return this;
  }

  _superzone($unit) {
    $unit.removeClass("adunit--leaderboard")
      .addClass("adunit--superzone");
  }

  initialize() {
    this.pluginConfig = {
      dfpID: this.getNetworkID(),
      setTargeting: this.formatKeywords(this.config),
      namespace: this.config.layers.join("/"),
      sizeMapping: this.config.sizeMapping,
      enableSingleRequest: false,
      collapseEmptyDivs: true,
      afterEachAdLoaded: ($adunit, event) => {
        this._adCallback.call(this, $adunit, event);
      }
    };

    this.load();
    return this;
  }

  @subscribe("reload", "ads")
  _reload() {
    this.pluginConfig.setTargeting = this.formatKeywords(window.lp.ads);
    this.load();
  }

  _slugify(string) {
    return string.toLowerCase().replace(" ", "-");
  }

  _adCallback($adunit, event) {
    let unit = $adunit.data("adUnit"),
        currentUnit;

    if (!unit) {
      currentUnit = new AdUnit($adunit);
      $adunit.data("adUnit", currentUnit);
    }

    if (!currentUnit.isEmpty()) {
      this._track($adunit);
    }

    if (event.size) {
      let callback = this.adCallbacks[event.size.join("x")];
      callback && this[callback] && this[callback]($adunit, event);
    }
  }

  @track("article ad impression load");
  _track($adunit) {
    return `${$adunit.data("sizeMapping")}-${$adunit[0].id}-${$adunit.data("adType") || "default"}`;
  }

  formatKeywords(config) {
    let keywords = {
      theme: config.theme,
      template: config.template,
      topic: config.topic,
      thm: config.adThm,
      ctt: this._slugify(config.continent),
      continent: this._slugify(config.continent),
      cnty: this._slugify(config.country),
      country: this._slugify(config.country),
      city: this._slugify(config.city),
      dest: this._slugify(config.destination),
      destination: this._slugify(config.destination)
    };

    if (window.Krux) {
      keywords.ksg = window.Krux.segments || "";
      keywords.kuid = window.Krux.user || "";
    }

    if (config.adTnm) {
      keywords.adTnm = config.adTnm.replace(/\s/, "").split(",");
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

  @subscribe("refresh", "ads")
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
