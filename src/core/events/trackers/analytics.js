import isJson from "../../utils/is_json";
import gaEventMap from "./ga_event_map";

/**
 * Track an event with our analytics library
 * @param {Object} options An object with event data
 */
export default function({ name, data } = {}) {
  /* global utag */
  data = (isJson(data) ? JSON.parse(data) : data) || "";

  let mappedEvent,
      gaEventData = {
        category: data ? data.category : "Destinations Next",
        action: name,
        label: isJson(data) ? JSON.stringify(data) : (data ? data.label : data)
      };

  if (mappedEvent = gaEventMap[name]) {
    for (let name in mappedEvent) {
      gaEventData[name] = mappedEvent[name];
    }
  } else {
    mappedEvent = gaEventData;
  }

  let utagEvent = Object.keys(gaEventData).reduce((memo, key) => {
    memo[key] = mappedEvent[key] || gaEventData[key];
    return memo;
  }, {});

  if (typeof window.lp.analytics != "undefined" && window.lp.analytics.api) {
    window.lp.analytics.api.trackEvent(utagEvent);
  } else {
    window.trackJs.console.log(`analytics: not loaded yet`);
  }
};
