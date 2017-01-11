import postal from "postal/lib/postal.lodash";
import HotelsEvents from "../components/hotels/hotels.events";
import assign from "lodash/assign";
import map from "lodash/map";

let _ = {
  assign, map
};

let componentChannel = postal.channel("components");

/**
 * Track an event with our analytics library
 * @param {Object} options An object with event data
 *
 */
let trackEvent = function(name, details) {
  if (window.lp.analytics.api.trackEvent) {
    window.lp.analytics.api.trackEvent({
      category: name,
      action: details
    });
  }
};

/**
 * Log an event with Flamsteed
 * @param  {Object|String} data An object containing data to log, or a string description of an event
 */
let flamsteedLog = function(description) {
  if (window.lp.fs) {
    window.lp.fs.log(typeof description === "string" ? {
      d: description
    } : description);
  }
};

let getPlace = () => {
  return window.lp.place;
};

componentChannel.subscribe(HotelsEvents.SEARCH, (data) => {
  let place = getPlace();

  _.assign(data.booking, {
    city: `${place.continentName}:${place.countryName}:${place.cityName}`
  });

  let serialized = _.map(data.booking, (val, key) => {
    return `${key}=${val}`;
  }).join("&");

  trackEvent("Partner Search", `partner=booking&${serialized}`);
});

componentChannel.subscribe("ttd.loadmore", () => {
  flamsteedLog("thing to do load more clicked");
});
