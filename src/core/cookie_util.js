/*global escape, unescape  */

class CookieUtil {
  getCookie(cookieName = "", format = "") {
    let contents = unescape(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" +
      escape(cookieName).replace(/[\-\.\+\*]/g, "\\$&") +
      "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;

    return (format.toUpperCase() === "JSON") ? JSON.parse(contents) : contents;
  }
}

export default CookieUtil;
