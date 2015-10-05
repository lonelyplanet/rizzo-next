import postal from "postal/lib/postal.lodash";

/**
 * Decorator for listening on an event bus (postal).
 * Will search the class for a `channel`, or use `/` by default.
 * @function
 * @param  {String} topic Topic to listen for
 * @param  {Object} options Objects for the subscription
 * @example
 * import "publish" from "path/to/core/decorators/publish"
 * 
 * class FooComponent () {
 *   @subscribe("foo.some.message")
 *   someMethod(data, subscription) {
 *     
 *   }
 *   @subscribe("foo.some.other")
 *   anotherMethod() {
 *     // ...
 *   }
 * }
 */
export default function subscribe(topic, channel, options) {
  return function(target, name, descriptor) {
    const fn = descriptor.value;

    let callback = function(data, envelope) {
      return fn.apply(target, [data, envelope, sub]);
    };

    descriptor.value = callback;

    let sub = postal.channel(channel || target.channel || "/").subscribe(topic, callback);
  };
}
