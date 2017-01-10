import analytics from "./trackers/analytics";
import flamsteed from "./trackers/flamsteed";
import postal from "postal/lib/postal.lodash";
import rizzo from "../../rizzo";

const TRACKERS = { analytics, flamsteed };
const TRACKING_CHANNEL = "tracking";

/**
 * Abstraction over tracking services such as Flamsteed and Google Analytics
 * @param  {Object} options
 * @param  {String} options.name The name of the event
 * @param  {String|Object} options.data Details of the event
 * @param  {Array} [options.trackers] An array of string names of trackers to use.
 */
export default function trackEvent ({
  name,
  data,
  trackers = ["flamsteed", "analytics"] } = {}
) {
  trackers.map((tracker) => {
    try {
      return {
        result: TRACKERS[tracker]({
          name, data
        }),
        tracker
      };
    }
    catch(e) {
      rizzo.logger.log(e);
      return false;
    }

  }).forEach(({ result, tracker }) => result !== false && postal.channel(TRACKING_CHANNEL).publish(`event.${tracker}.tracked`, {
    name, data
  }));
}
