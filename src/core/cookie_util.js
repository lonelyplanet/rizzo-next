/*global escape, unescape  */

/**
 * A utility for managing cookies
 */
export default class CookieUtil {
  constructor({ cookies = null } = {}) {
    this.cookies = cookies;
  }
  /**
   * Retrievew a cookie by it's name
   * @param  {String} cookieName Name of the cookie to retrieve
   * @param  {String} format Whether or not the cookie should be parsed with JSON
   * @return {String|Object} The cookie
   */
  getCookie(cookieName = "", format = "") {
    let contents = unescape(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" +
      escape(cookieName).replace(/[\-\.\+\*]/g, "\\$&") +
      "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;

    return (format.toUpperCase() === "JSON") ? JSON.parse(contents) : contents;
  }
  /**
   * Set a cookie
   * @param {String} k Cookie name
   * @param {String} v Cookie value
   * @param {[Number]} days Expiration in days
   * @param {[String]} domain Domain of the cookie
   * @param {[String]} path Path of the cookie
   */
  setCookie(k, v, days, domain, path) {
    let exp = "";

    if (days && (days !== 0)) {
      exp = new Date();
      exp.setTime(exp.getTime() + (days * 86400000));
      exp = ";expires=" + exp.toGMTString();
    }

    domain = domain ? (";domain=" + domain) : "";
    path = ";path=" + (path || "/");

    let cookie = k + "=" + v + exp + domain + path;

    // Explicit test for null here because of default argument above
    return (this.cookies !== null ?
      (this.cookies = cookie) :
      (document.cookie = cookie)
    );
  }
  removeCookie(name) {
    let cookieString = `${name}=`;
    let expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() - 86400 * 1000);
    cookieString += ";max-age=0";
    cookieString += `;expires=${expiryDate.toUTCString()}`;
    document.cookie = cookieString;
  }
}
