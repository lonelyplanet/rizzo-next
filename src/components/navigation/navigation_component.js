import { Component } from "../../core/bane";
import Overlay from "../overlay";
import Notification from "../notification/notification";
import waitForTransition from "../../core/utils/waitForTransition";
import NavigationActions from "./navigation_actions";
import NavigationState from "./navigation_state";
import Tabs from "../tabs/tabs_component";

class NavigationComponent extends Component {

  initialize() {
    this.state = NavigationState.getState();
    this.overlay = new Overlay();

    this.notification = new Notification({
      target: this.$el.find(".js-cart-notification"),
      content: this.state.cartItemCount
    });

    this.name = "navigation";
    this.$mobileNavigation = this.$el.find(".mobile-navigation").detach();
    this.$mobileNavigation.on("click", ".js-close", this._clickNav.bind(this));

    // SubNavigation hover
    this.handleHover();

    // Events
    this.listenTo(NavigationState, "changed:nav", this.toggleNav);
    this.listenTo(this.overlay, "click", this._clickNav);

    this.tabs = new Tabs({
      el: $(".navigation").find(".tabs")
    });
  }

  handleHover() {
    this.$el.find(".navigation__item")
      .each((i, el) => {
        let $el = $(el);
        let $subNavigation = $el.find(".sub-navigation");
        let hideTimer, showTimer;

        if($subNavigation.length === 0) {
          return;
        }

        $el.on("mouseenter", () => {
          clearTimeout(hideTimer);

          showTimer = setTimeout(() => {
            $subNavigation.addClass("sub-navigation--visible");
          }, 0);
        });

        $el.on("mouseleave", () => {
          clearTimeout(showTimer);

          hideTimer = setTimeout(() => {
            $subNavigation.removeClass("sub-navigation--visible");
          }, 100);
        });
      });
  }

  toggleNav() {
    if(this.state.isNavOpen) {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    if(!this.state.isNavOpen){
      return Promise.all([]);
    }

    if(this.$mobileNavigation.parents().length === 0) {
      this.$mobileNavigation.appendTo(document.body);
    }

    this.overlay.show();

    setTimeout(() => {
      this.$mobileNavigation.addClass("mobile-navigation--visible");
    }, 20);

    return waitForTransition(this.$mobileNavigation, { fallbackTime: 2000 });
  }

  hide() {
    if(this.state.isNavOpen) {
      return Promise.all([]);
    }

    this.$mobileNavigation.removeClass("mobile-navigation--visible");

    this.overlay.hide();

    return waitForTransition(this.$mobileNavigation, { fallbackTime: 2000 })
      .then(() => {
        this.$mobileNavigation.detach();
      });
  }

  _clickNav() {
    NavigationActions.clickNav();
  }

}

export default NavigationComponent;
