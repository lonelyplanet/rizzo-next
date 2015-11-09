import trackEvent from "../events/track_event";

/**
 * Use when you need to track a method call w/ the `trackEvent` utility.
 * The value returned will be passed as `data` to `trackEvent`.
 * If a function is used for the `trackingFn`, it must return an object w/ a `name`, and optional `data`
 * @param  {Function|String} trackingFn Either a function to build up the event data or a string event name.
 * @param  {Object} [options] An opject of options
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
export default function track(trackingFn, options) {
  return function(target, name, descriptor) {
    const fn = descriptor.value;

    descriptor.value = function() {
      let value = fn.apply(this, arguments);
      
      trackEvent(typeof trackingFn === "string" ? Object.assign({ name: trackingFn, data: value }, options) : trackingFn.apply(this, [value]));

      return value;
    };
  };
}
