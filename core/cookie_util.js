/*global escape, unescape  */

class CookieUtil {
  getCookie(cookieName = "") {
    return JSON.parse(unescape(
      document.cookie.replace(
      new RegExp("(?:(?:^|.*;)\\s*" +
      escape(cookieName).replace(/[\-\.\+\*]/g, "\\$&") +
      "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null);
  }
}

export default CookieUtil;
