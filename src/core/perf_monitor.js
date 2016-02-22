import subscribe from "./decorators/subscribe";
import channel from "./decorators/channel";
import RizzoEvents from "./rizzo_events";
import { mark, measure } from "./utils/perf";

/**
 * Records some performance data about our component rendering.
 */
export default class PerfMonitor {
  get loadCritical() {
    return `mark_${RizzoEvents.LOAD_CRITICAL}`;
  }
  get loadBelow() {
    return `mark_${RizzoEvents.LOAD_BELOW}`;
  }
  constructor() {
    // Disabling for now to see if webpagetest works without them
    // this.subscribe();
  }
  /**
   * Listens for when our critical code is loaded and creates a perf mark
   */
  @subscribe(RizzoEvents.LOAD_CRITICAL)
  @channel("events")
  loadCritical() {
    mark(this.loadCritical);
  }
  /**
   * Listens for when our below the fold code is loaded and creates a perf mark
   */
  @subscribe(RizzoEvents.LOAD_BELOW)
  loadBelow() {
    mark(this.loadBelow);

    measure(`mark_critical_to_below`, this.loadCritical, this.loadBelow);
    measure(`mark_critical`, "domContentLoadedEventEnd", this.loadCritical);
  }
}
