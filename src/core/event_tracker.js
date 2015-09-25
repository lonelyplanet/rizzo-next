import postal from "postal/lib/postal.lodash";
import HotelsEvents from "../components/hotels/hotels.events";
import assign from "lodash/object/assign";
import map from "lodash/collection/map";

let _ = {
  assign, map
};

let componentChannel = postal.channel("components");

let trackEvent = function() {
  if (window.lp.analytics.api.trackEvent) {
    window.lp.analytics.api.trackEvent.apply(this, arguments);
  }
};

let flamsteedLog = function(data) {
  if (window.lp.fs) {
    window.lp.fs.log(data);
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

  trackEvent({ 
    category: "Partner Search",
    action: `partner=booking&${serialized}`
  });
});

componentChannel.subscribe("ttd.loadmore", () => {
  flamsteedLog({
    d: "thing to do load more clicked"
  });
});
