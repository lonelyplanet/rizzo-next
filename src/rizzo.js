import Logger from "./core/logger";

class ComponentRegistry {
  constructor() {
    this.instances = [];
  }
  add(instance) {
    this.instances.push(instance)
  }
}

/**
 * Rizzo thing
 */
class Rizzo {  
  constructor({ registry, logger }) {
    this.registry = registry;
    this.logger = logger;
  }
  /**
   * Render a component
   * @param  {Component} Component The component to register
   * @param  {Object} options Options to pass into instance creation
   * @return {Object} Instance of the component
   */
  renderComponent(Component, options = {}) {
    if (typeof options === "string") {
      options = {
        el: options
      };
    }

    let instance;
    try {
      instance = new Component(options);
      this.registry.add(instance);
    } catch(e) {
      this.logger.error(e);
    }

    return instance;
  }
}

let rizzo = window.rizzo = new Rizzo({
  registry: new ComponentRegistry(),
  logger: new Logger()
});

export default rizzo;
