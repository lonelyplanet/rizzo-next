import assign from "lodash/assign";
import Events from "../../core/mixins/events";
import Arkham from "../../core/arkham";
// Commenting out until we get new shop cookie figured out
// import ShopCookieUtil from "../../core/shop_cookie_util";

/* mock data */

let state = {
  isOpen: false,
  isNavOpen: false,
  cartItemCount: 0, // Commenting out for now... new ShopCookieUtil().getShopItemCount(),
  cart: {
    title: "YOUR SHOPPING CART",
    items: [ { name: "Thailand Travel Guide", price: "$19.99",
              image: "http://www.trentcap.com/wp/wp-content/uploads/2012/02/sample-img.png",
              alt: "Thailand Travel Guide" },
            { name: "Southeast Asia on a Shoes", price: "$29.99",
              image: "http://www.trentcap.com/wp/wp-content/uploads/2012/02/sample-img.png",
              alt: "Thailand Travel Guide" } ],
    action: "https://shop.lonelyplanet.com/cart/view",
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
