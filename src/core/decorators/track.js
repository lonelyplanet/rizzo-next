import trackEvent from "../events/track_event";

/**
 * Use when you need to track a method call w/ the `trackEvent` utility.
 * The value returned will be passed as `data` to `trackEvent`.
 * If a function is used for the `trackingFn`, it must return an object w/ a `name`, and optional `data`
 * @param  {Function|String} trackingFn Either a function to build up the event data or a string event name.
 * @param  {Object} [options] An opject of options
 * @param  {Boolean} [options.returnValue] Whether or not to send the return value
 * @return {Function} The decorator function
 * @example <caption>String Tracking</caption>
 *
 * class Foo {
 *   @track("Button Clicked")
 *   buttonClicked() {
 *     // ...
 *     return { some: "data" };
 *   }
 * }
 * @example <caption>Function</caption>
 *
 * import FooTracker from "./foo.tracker";
 * 
 * class Foo {
 *   @track(FooTracker.clicked)
 *   buttonClicked() {
 *     // ...
 *     return { some: "data" };
 *   }
 * }
 *
 * // foo.tracker.js
 *
 * export default function clicked(data) {
 *   // data = { some: "data" } 
 *   data.otherData = "other data";
 *   
 *   return { 
 *     name: "Button Clicked",
 *     data
 *   };
 * }
 * 
 */
function track(trackingFn, options={ returnValue: true }) {
  return function(target, name, descriptor) {
    const hasDescriptor = typeof descriptor.value !== "undefined";
    const fn = hasDescriptor ? descriptor.value : target;

    function trackDecorator() {
      let value = fn.apply(this, arguments);
      
      trackEvent(typeof trackingFn === "string" ? Object.assign({ name: trackingFn, data: value }, options) : trackingFn.apply(this, [value]));

      return options.returnValue ? value : null;
    };

    if (hasDescriptor) {
      descriptor.value = trackDecorator;
    }
    else {
      target = trackDecorator;
    }
  };
}

export default track;
