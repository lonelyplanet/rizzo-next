import map from "lodash/map";

let _ = { map };

/**
 * Must return an object w/ name and date, and optional trackers []
 */
export default {
  search(data) {
    let place = window.lp.place;

    data.booking.city = `${place.continentName}:${place.countryName}:${place.cityName}`;

    let serialized = _.map(data.booking, (val, key) => {
      return `${key}=${val}`;
    }).join("&");

    return {
      name: "Partner Search",
      data: `partner=booking&${serialized}`
    };
  }
};
