import isJson from "../../utils/is_json";

/** 
 * Track an event with our analytics library
 * @param {Object} options An object with event data
 */
export default function({ name, data } = {}) {
  /* global utag */
  if (utag && typeof utag.link === "function") {
    data = (isJson(data) ? JSON.parse(data) : data) || {};
    
    let category, action;

    if (name.toLowerCase() === "partner search") {
        category = "Partner";
        action = "Search";
    }

    let event = {
        ga_event_category: category || "Destinations Next",
        ga_event_action: action || name,
        ga_event_label: JSON.stringify(data)
    };

    if (typeof ENV_PROD !== "undefined" && !ENV_PROD) {
      console.log(`utag: ${JSON.stringify(event)}`);
    } else {
      utag.link(event);      
    }
  }
};
