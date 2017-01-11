import $ from "jquery";
import Events from "./mixins/events";
import assign from "lodash/assign";
import pick from "lodash/pick";
import bind from "lodash/bind";
import each from "lodash/each";
import uniqueId from "lodash/uniqueId";
import postal from "postal/lib/postal.lodash";

// Can pass in options that contains these keys. They will automatically be added to `this`
let listOfOptions = [ "el", "events", "container" ];
// Regex for the "click .foo .bar" in the events
let delegateEventSplitter = /^(\S+)\s*(.*)$/;

/**
* The main class that will be extended when a new componenet is created.
* Extend this class with es6 syntax.
* @example
* import { Component } from "./core/bane"
*
* class ArticlesComponent extends Component {
*   initialize() {
*     this.events = {
*       "click .foo": "fooClicked"
*     }
*   }
*   render() {
*     //...
*   }
*   fooClicked() {
*     //...
*   }
* }
*/
export default class Component {
  /**
   * Constructs a component
   * @param  {[Options]} options An options object
   * @param {Element} options.el An element to attatch this component to
   * @param {Object} options.events A key value pair of events
   */
  constructor(options) {
    this.cid = uniqueId("comp");
    this.channel = "components";

    // Assign things from the passed in options to `this`
    assign(this, pick(options, listOfOptions));

    this._ensureElement();

    this.initialize.apply(this, arguments);

    this._delegateEvents();
  }
  initialize() {
    // Overwrite the initialize method in your component for initial setup
  }
  /**
   * Override this method with custom rendering logic
   * @return {Object} Instance of the component
   */
  render() {
    // Overwrite me with awesomesauce
    return this;
  }
  /**
   * This method actually builds the template and inserts the HTML into the DOM
   * @param  {Object} data The data to pass to a template function
   * @return {jQuery} Returns the element
   */
  build(data) {
    if (this.el) {
      return this.$el.html(typeof this.template === "function" ? this.template(data) : this.template);
    }
  }
  /**
   * Pull data off of a custom data attribute `data-lp-initial-abc`.
   * This allows for server side JSON data to be embeded in the document.
   * @example <caption>HTML</caption>
   * <div data-lp-initial-cards="{{cards}}"></div>
   *
   * @example <caption>JavaScript</caption>
   * let state = this.getInitialState();
   * state.cards; // { cards: ... }
   *
   * @return {Object} The parsed JSON data
   */
  getInitialState() {
    if (this.__initialState__) {
      return this.__initialState__;
    }

    let state = this.__initialState__ = {};

    each(this.$el.data(), (val, key) => {
      if (key.indexOf("lpInitial") > -1) {
        let parsed = null;
        // No...no... please god no... nooooooooooooo.
        try {
          if (val.source) {
            let tmp = [];
            each(val.source, function(str) {
              tmp.push(JSON.parse(str));
            });
            val = tmp;
          }
          parsed = JSON.parse(val);
        } catch (e) {
          parsed = val;
        }

        let cleanKey = key.replace("lpInitial", "").toLowerCase();
        state[cleanKey] = parsed;

        this.$el.removeAttr(`data-lp-initial-${cleanKey}`);
      }
    });

    return state;
  }
  /**
  * Allows you to delegate events to the element the component is attached to. In the `initialize` method of your
  * component, simply add an `events` object to `this
  * @example
  *  initialize() {
  *    this.events = {
  *      "click": "someMethod",
  *      "click .button": "anotherMethod"
  *    }
  *  }
  */
  _delegateEvents(events) {
    if (!(events || (events = this.events))) {
      return this;
    }
    this._undelegateEvents();

    for (let key in events) {
      let method = events[key];
      if (typeof method !== "function") {
        method = this[events[key]];
      }
      if (!method) {
        continue;
      }

      let match = key.match(delegateEventSplitter);
      let eventName = match[1], selector = match[2];
      method = bind(method, this);
      eventName += ".delegateEvents" + this.cid;
      if (selector === "") {
        this.$el.on(eventName, method);
      } else {
        this.$el.on(eventName, selector, method);
      }
    }
    return this;
  }
  /**
   * Turns off event delegation for the component
   * @return {Object} The component instance
   */
  _undelegateEvents() {
    this.$el.off(".delegateEvents" + this.cid);
    return this;
  }
  // Wraps `this.el` with jQuery
  _ensureElement() {
    if (this.el) {
      this.$el = $(this.el);
    } else {
      this.$el = $("<div/>");
      this.el = this.$el[0];
    }

    this.$el.addClass("lp-component")
      .data("lpComponent", this);
  }
  /**
   * Publish an event on the `components` channel
   * @param  {String} topic Topic to publish
   * @param  {Object} data Data to publish on the channel
   */
  publish(topic, data) {
    return postal.channel("components").publish(topic, data);
  }
}

assign(Component.prototype, Events);
