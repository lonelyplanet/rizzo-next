/**
 * Checks against a specified media query string. Adds a listener for
 * `matchMedia` and runs a callback function when the media query matches.
 * @param  {String}   query    Media query to listen for
 * @param  {Function} callback Callback function to run when the query
 *                             matches.
 * @example
 * import matchMedia from "../../core/utils/matchMedia";
 *
 * matchMedia("(min-width: 720px)", (query) => {
 *   if (query.matches) {
 *     // do this
 *   } else {
 *     // do that
 *   }
 * });
 */
export default function(query, callback) {
  let media = window.matchMedia(query);

  if (typeof callback === "function") {
    media.addListener(callback);

    callback(media);
  }
}
