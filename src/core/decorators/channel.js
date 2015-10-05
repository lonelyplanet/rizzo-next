import postal from "postal/lib/postal.lodash";

/**
 * Sets up the channel for subcriptions. 
 * Keep in mind that after you use it, all other subscriptions underneath will use the same channel
 * @see subscribe
 * @param  {String} channelName Channel name for the class
 * @example
 * import "publish" from "path/to/core/decorators/publish"
 * 
 * class FooComponent () {
 *   @subscribe("foo.some.other")
 *   @channel("foobar")
 *   anotherMethod() {
 *     // ...
 *   }
 *   @subscribe("foo.yet.another")
 *   anotherMethod() {
 *     // Still on the "foobar channel"
 *   }
 *   @subscribe("foo.yet.another")
 *   @channel("another")
 *   anotherMethod() {
 *     // Now we're on another channel
 *   }
 * }
 */
export default function channel(channelName) {
  return function(target) {
    target.channel = channelName;
  };
}
