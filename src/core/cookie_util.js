/*global escape, unescape  */

class CookieUtil {
  constructor({ cookies = null } = {}) {
    this.cookies = cookies;
  }
  getCookie(cookieName = "", format = "") {
    let contents = unescape(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" +
      escape(cookieName).replace(/[\-\.\+\*]/g, "\\$&") +
      "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;

    return (format.toUpperCase() === "JSON") ? JSON.parse(contents) : contents;
  }
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
}

export default CookieUtil;
