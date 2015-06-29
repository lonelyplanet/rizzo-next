import { Component } from "../../core/bane";
import NavigationActions from "./navigation_actions";
import Notification from "../notification/notification";
import NavigationState from "./navigation_state";

class Navigation extends Component {
  initialize() {
    let state = this.state = NavigationState.getState();

    this.name = "navigation";

    this.events = {
      "click .js-menu": "_clickNav"
    };

    this.$mobileNavigation = this.$el.find('.mobile-navigation').detach();

    /***TODO tooltip not yet needed

    this.cartTemplate = require("components/navigation/user_cart.hbs");
    this.tooltip = new Tooltip({
      content: this.cartTemplate(state.cart)
    });

    this.listenTo(NavigationState, "changed:cart", this.toggleCart);
    ***/

    this.search = new SearchUtil({
      el: this.$el.find(".js-search")
    });

    new Notification({
      target: this.$el.find(".js-cart-notification"),
      content: state.cartItemCount
    });

    this.listenTo(NavigationState, "changed:nav", this.toggleNav);
  }

  toggleNav(data) {
    if(this.$mobileNavigation.parents().length < 0) {
      this.$mobileNavigation.appendTo(document.body);
    }

    this.$mobileNavigation.toggleClass('mobile-navigation--visible', state.isNavOpen);

    //this.$el.closest(".js-body").toggleClass("is-nav-open", data.isNavOpen);
  }

  _clickNav() {
    console.log('clicknav');
    NavigationActions.clickNav();
  }

  //_tapHamburger() {
  //  this._clickNav();
  //
  //  let handle = this.$el.find(".js-hamburger-menu");
  //
  //  if (handle.hasClass("is-closed")) {
  //    handle.removeClass("is-closed").addClass("is-open");
  //  } else {
  //    handle.removeClass("is-open").addClass("is-closed");
  //  }
  //}
}

export default Navigation;
