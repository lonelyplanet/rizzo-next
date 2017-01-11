import assign from "lodash/assign";
import Events from "../../core/mixins/events";
import Arkham from "../../core/arkham";
import ShopCookieUtil from "../../core/shop_cookie_util";

/* mock data */

let state = {
  isOpen: false,
  isNavOpen: false,
  cartItemCount: new ShopCookieUtil().getShopItemCount(),
  cart: {
    title: "YOUR SHOPPING CART",
    items: [ { name: "Thailand Travel Guide", price: "$19.99",
              image: "http://www.trentcap.com/wp/wp-content/uploads/2012/02/sample-img.png",
              alt: "Thailand Travel Guide" },
            { name: "Southeast Asia on a Shoes", price: "$29.99",
              image: "http://www.trentcap.com/wp/wp-content/uploads/2012/02/sample-img.png",
              alt: "Thailand Travel Guide" } ],
    action: "http://shop.lonelyplanet.com/cart/view",
    actiontitle: "PROCEED TO CHECKOUT"
  }
};

let NavigationState = {
  getState: () => {
    return state;
  }
};

assign(NavigationState, Events);

Arkham.on("navigation.click", function() {
  state.isNavOpen = !state.isNavOpen;
  NavigationState.trigger("changed:nav", state);
});


export default NavigationState;
