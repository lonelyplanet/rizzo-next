import { Component } from "./bane";

/**
 * Register components with Rizzo
 */
export default class ComponentRegistry {
  /**
   * Constructs the ComponentRegistry
   * @param {Logger} options.logger Instance of a logger
   */
  constructor({ logger } = {}) {
    this.components = new Map();
    this.logger = logger;
  }
  /**
   * Create an instance of a given component. 
   * Will also register the component.
   * @param  {Component} Component A constructor that extends `Component`
   * @param  {[object]} options Options to pass to the constructor
   * @return {object} Instance of the component
   */
  createInstanceOf(Component, options) {
    if (!this.components.has(Component.name)) {
      this.register(Component);
    }

    let instances = this.components.get(Component.name);

    let instance = null;
    try {
      instance = new Component(options);
      instances.push(instance);
    } catch(e) {
      if (typeof ENV_PROD !== "undefined" && !ENV_PROD) {
        throw e;
      }
      else {
        this.logger.error(e);
      }
    }    
    
    return instance;
  }
  /**
   * Get instances of a specific component, by either it's string or Constructor
   * @param  {Component|String} Component Either the Constructor or the string name of a constructor
   * @return {Array} An array of all instances of the component
   * @example
   * rizzo.renderComponent(MastheadComponent, {});
   * rizzo.registry.getInstancesOf(MastheadComponent); // [MastheadComponent]
   * 
   */
  getInstancesOf(Component) {
    let name = typeof Component === "function" ? Component.name : Component;
    return this.components.get(name);
  }
  /**
   * Add a new Component to the registry.
   * Must extend the `Component` constructor
   * @param  {Component} Constructor The component being added
   */
  register(Constructor) {
    if (Object.getPrototypeOf(Constructor) !== Component) {
      throw "Can only register Components";
    }

    this.components.set(Constructor.name, []);
  }
}
