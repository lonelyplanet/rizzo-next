/** 
 * Track an event with our analytics library
 * @param {Object} options An object with event data
 */
export default function({ name, data } = {}) {
  if (window.lp.analytics && window.lp.analytics.api.trackEvent) {
    window.lp.analytics.api.trackEvent({ 
      category: name,
      action: data || {}
    });
  }
};
