import isJson from "../../utils/is_json";
import isDev from "../../utils/is_dev";
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
        category: "Destinations Next",
        action: name,
        label: isJson(data) ? JSON.stringify(data) : data
      };

  if (mappedEvent = gaEventMap[name]) {
    for (let name in mappedEvent) {
      gaEventData[name] = mappedEvent[name];
    }
  } else {
    mappedEvent = gaEventData;
  }

  let utagEvent = Object.keys(gaEventData).reduce((memo, key) => {
    memo["ga_event_" + key] = mappedEvent[key] || gaEventData[key];
    return memo;
  }, {});

  if (isDev()) {
    console.log(`utag: ${JSON.stringify(utagEvent)}`);
  } else if (
    typeof window.utag !== "undefined" && 
    typeof window.utag.link === "function") {
    window.utag.link(utagEvent);
  } else {
    window.trackJs.console.log(`utag: not loaded yet`);
  }
};
