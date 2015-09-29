import $ from "jquery";
import Events from "./mixins/events";
import assign from "lodash/object/assign";
import pick from "lodash/object/pick";
import bind from "lodash/function/bind";
import each from "lodash/collection/each";
import uniqueId from "lodash/utility/uniqueId";
import postal from "postal/lib/postal.lodash";

// Can pass in options that contains these keys. They will automatically be added to `this`
let listOfOptions = [ "el", "events", "container" ];
// Regex for the "click .foo .bar" in the events
let delegateEventSplitter = /^(\S+)\s*(.*)$/;

/**
* The main class that will be extended when a new componenet is created.
* Extend this class with es6 syntax
* @example
*     import { Component } from "./core/bane"
*
*     class ArticlesComponent extends Component {
*       render() {
*
*       }
*     }
*/
export class Component {
  get channel() {
    return "components";
  }
  constructor(options) {
    this.cid = uniqueId("comp");

    // Assign things from the passed in options to `this`
    assign(this, pick(options, listOfOptions));

    this._ensureElement();

    this.initialize.apply(this, arguments);

    this._delegateEvents();
  }
  initialize() {
    // Overwrite the initialize method in your component for initial setup
  }
  render() {
    // Overwrite me with awesomesauce
  }
  // This method actually builds the template and inserts the HTML into the DOM
  build(data) {
    if (this.el) {
      this.$el.html(typeof this.template === "function" ? this.template(data) : this.template);
    }
  }
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
  // Allows you to delegate events to the element the component is attached to. In the `initialize` method of your
  // component, simply add an `events` object to `this
  //
  //     initialize() {
  //       this.events = {
  //         "click": "someMethod",
  //         "click .button": "anotherMethod"
  //       }
  //     }
  //
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
  // Turns off event delegation for the component
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
  }
  publish(topic, data) {
    postal.channel("components").publish(topic, data);
  }
}

assign(Component.prototype, Events);
