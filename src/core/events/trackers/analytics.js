/** 
 * Track an event with our analytics library. 
 * This will post to tealium with the name of the event as the action, the category as Destinations Next
 * and the label will be the stringified data
 * @example <caption>Standard Tracking</caption>
 *
 * analytics("Some Event", { some: "data" });
 * // Will send to google analytics as...
 * // { category: "Destinations Next", action: "Some Event", label: "{ some: 'data' }" } 
 * 
 * @param {Object} options An object with event data
 */
export default function({ name, data } = {}) {
  if (!window.lp.analytics || !window.lp.analytics.api.trackEvent) {
    return;
  }

  let eventData = {
    action: name
  };
  
  if (data) {
    eventData.label = data;
  }

  window.lp.analytics.api.trackEvent({ 
    category: "Destinations Next",
    action: JSON.stringify(eventData)
  });
};
