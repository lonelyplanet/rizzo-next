/**
 * Rizzo thing
 */
export default class Rizzo {  
  constructor({ registry, logger }) {
    this.registry = registry;
    this.logger = logger;
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
}
