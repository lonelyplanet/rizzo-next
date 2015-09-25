import postal from "postal/lib/postal.lodash";

/**
 * Decorator for publishing on an event bus (postal).
 * Whatever the decorated function returns gets published as the data.
 * Will search the class for a `channel`, or use `/` by default.
 * @param  {String} topic Topic to publish on
 * @param  {String} channel Channel to publish on
 * @example
 * import "publish" from "path/to/core/decorators/publish"
 * 
 * class FooComponent () {
 *   @publish("foo.some.message")
 *   someMethod() {
 *     return {
 *       my: "data"
 *     };
 *   }
 *   @publish("foo.some.other")
 *   anotherMethod() {
 *     // ...
 *   }
 * }
 */
export default function publish(topic, channel) {
  return function(target, name, descriptor) {
    const fn = descriptor.value;

    descriptor.value = function() {
      let value = fn.apply(this, arguments);
      postal.channel(channel || target.channel || "/").publish(topic, value);
    };
  };
}
