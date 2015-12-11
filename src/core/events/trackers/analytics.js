import isJson from "../../utils/is_json";
import isDev from "../../utils/is_dev";

/**
 * Track an event with our analytics library
 * @param {Object} options An object with event data
 */
export default function({ name, data } = {}) {
  /* global utag */
  data = (isJson(data) ? JSON.parse(data) : data) || {};

  let category, action;

  if (name.toLowerCase() === "partner search") {
    category = "Partner";
    action = "Search";
  } else if (name.toLowerCase() === "ad page load impression") {
    category = "advertising";
    action = "page-load-impression";
  } else if (name.toLowerCase() === "ad ajax load impression") {
    category = "advertising";
    action = "ajax-page-load-impression";
  }

  let event = {
    ga_event_category: category || "Destinations Next",
    ga_event_action: action || name,
    ga_event_label: JSON.stringify(data)
  };

  if (isDev()) {
    console.log(`utag: ${JSON.stringify(event)}`);
  } else if (utag && typeof utag.link === "function") {
    utag.link(event);
  }
};
