/**
 * Log an event with Flamsteed
 * @param  {Object|String} data An object containing data to log, or a string description of an event
 */
export default function({ name, data } = {}) {
  if (window.lp.fs) {
    window.lp.fs.log({ name, data });
  }
};
