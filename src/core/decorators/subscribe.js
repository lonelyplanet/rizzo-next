import postal from "postal/lib/postal.lodash";
import each from "lodash/each";

let _ = { each };

function addSubscribeMethod(target) {
  let subscriptions;
  if (!(subscriptions = target.constructor.subscriptions)) {
    return;
  }

  target.subscribe = function() {
    let subscriptionInstances = [];

    _.each(subscriptions, (topic) => {
      _.each(topic, (sub) => {
        let subDef;
        subscriptionInstances.push(
          (subDef = postal.channel(sub.channel)
          .subscribe(sub.topic, function(data, env) {
            // Call the callback and also pass the sub definition
            this[sub.callback].apply(this, [data, env, subDef]);
          })
          .context(this))
        );
      });
    });

    this["_subscriptions"] = subscriptionInstances;
  };

  return;
}

/**
 * Decorator for listening on an event bus (postal).
 * Will search the class for a `channel`, or use `/` by default.
 * **NOTE:** You have to call `this.subscribe()` in the constructor in order to have postal actually attatch the listeners correctly.
 * @function
 * @param  {String} topic Topic to listen for
 * @param  {String} channel The channel to listen on
 * @example <caption>Default Channel</caption>
 * import publish from "path/to/core/decorators/publish"
 *
 * class FooComponent () {
 *   constructor() {
 *     // This is required
 *     this.subscribe();
 *   }
 *   @subscribe("foo.some.message")
 *   someMethod(data, evnelope, subscription) {
 *
 *   }
 *   @subscribe("foo.some.other")
 *   anotherMethod(data, evnelope, subscription) {
 *     // ...
 *   }
 * }
 * @example <caption>Custom Channel</caption>
 * import publish from "path/to/core/decorators/publish"
 *
 * class FooComponent () {
 *   constructor() {
 *     // This is required
 *     this.subscribe();
 *   }
 *   @subscribe("foo.some.message", "custom")
 *   someMethod(data, envelope, subscription) {
 *     // ...
 *   }
 * }
 * @example <caption>Channel decorator</caption>
 * import publish from "path/to/core/decorators/publish";
 * import channel from "path/to/core/decorators/channel"
 *
 * class FooComponent () {
 *   constructor() {
 *     // This is required
 *     this.subscribe();
 *   }
 *   @subscribe("foo.some.message")
 *   @channel("custom")
 *   someMethod(data, envelope, subscription) {
 *     // ...
 *   }
 * }
 */
export default function subscribe(topic, channel) {
  return function(target, name) {
    let ctor = target.constructor;
    ctor.subscriptions = ctor.subscriptions || {};
    let subs = ctor.subscriptions[topic] = ctor.subscriptions[topic] || [];

    subs.push({ topic, channel: channel || target.channel || "/", callback: name });

    if (!target.subscribe) {
      addSubscribeMethod(target);
    }
  };
}
