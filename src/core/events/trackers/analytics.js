import isJson from "../../utils/is_json";
import isDev from "../../utils/is_dev";

/**
 * Track an event with our analytics library
 * @param {Object} options An object with event data
 */
export default function({ name, data } = {}) {
  /* global utag */
  data = (isJson(data) ? JSON.parse(data) : data) || {};

  let category, action, label;

  if (name.toLowerCase() === "partner search") {
    category = "Partner";
    action = "Search";
  } else if (name.toLowerCase() === "article ad impression load") {
    category = "advertising";
    action = "page-load-impression";
    label = data;
  } else if (name.toLowerCase() === "article ad impression scroll") {
    category = "advertising";
    action = "page-load-impression";
    label = data;
  } else if (name.toLowerCase() === "article pageview scroll") {
    category = "related-article";
    action = "scroll";
    label = data;
  } else if (name.toLowerCase() === "article pageview click") {
    category = "related-article";
    action = "click";
    label = data;
  } else if (name.toLowerCase() === "gallery click") {
    category = data.category;
    action = "click";
    label = data.label;
  } else if (name.toLowerCase() === "share menu click") {
    category = data.category;
    action = "click";
    label = data.label;
  } else if (name.toLowerCase() === "share button click") {
    category = data.category;
    action = "click";
    label = data.label;
  }

  let event = {
    ga_event_category: category || "Destinations Next",
    ga_event_action: action || name,
    ga_event_label: label || JSON.stringify(data)
  };

  if (isDev()) {
    console.log(`utag: ${JSON.stringify(event)}`);
  } else if (utag && typeof utag.link === "function") {
    utag.link(event);
  }
};
