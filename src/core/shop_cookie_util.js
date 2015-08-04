import CookieUtil from "./cookie_util";

class ShopCookieUtil extends CookieUtil{
  getShopItemCount() {
    let shopCartCookie = this.getCookie("shopCartCookie", "JSON");
    return (shopCartCookie && shopCartCookie.A) ?
    shopCartCookie.A.length : null;
  }
}

export default ShopCookieUtil;
