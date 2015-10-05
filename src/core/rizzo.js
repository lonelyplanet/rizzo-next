import publish from "./decorators/publish";
import postal from "postal/lib/postal.lodash";
import events from "./rizzo_events";

/**
 * Rizzo thing
 */
export default class Rizzo {  
  constructor({ registry, logger, perf }) {
    this.registry = registry;
    this.logger = logger;
    this.perf = perf;
    this.events = events;
  }
  /**
   * Render a component
   * @param  {Component} Component The component to register
   * @param  {Object} options Options to pass into instance creation
   * @return {Object} Instance of the component
   * @example
   * rizzo.renderComponent(MastheadComponent, {});
   * 
   */
  renderComponent(Component, options = {}) {
    if (typeof options === "string") {
      options = {
        el: options
      };
    }

    let instance = this.registry.createInstanceOf(Component, options);

    return instance;
  }
  /**
   * Mark a rizzo event
   */
  event(name, data) {
    postal.channel("events").publish(name, data);
  }
}
