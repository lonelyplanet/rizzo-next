import { Component } from "../../core/bane";
import Overlay from "../overlay";
import Notification from "../notification/notification";
import waitForTransition from "../../core/utils/waitForTransition";
import NavigationActions from "./navigation_actions";
import NavigationState from "./navigation_state";
import Tabs from "../tabs/tabs_component";
import subscribe from "../../core/decorators/subscribe";

let userPanelTemplate = require("./user_panel.hbs");

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

    this.subscribe();
  }
  /**
   * Set up hover events to trigger the sub menu's opening and closing.
   * Use event delegation here because the user login is dynamically added.
   * @return {[type]} [description]
   */
  handleHover() {
    let hideTimer, showTimer;

    this.$el.on("mouseenter", ".navigation__item", (event) => {
      clearTimeout(hideTimer);

      // Always clear the currently active one
      this.$el.find(".sub-navigation").removeClass("sub-navigation--visible");

      showTimer = setTimeout(() => {
        $(event.currentTarget).find(".sub-navigation").addClass("sub-navigation--visible");
      }, 0);
    });

    this.$el.on("mouseleave", ".navigation__item", (event) => {
      clearTimeout(showTimer);

      hideTimer = setTimeout(() => {
        $(event.currentTarget).find(".sub-navigation").removeClass("sub-navigation--visible");
      }, 100);
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

  @subscribe("user.status.update")
  userStatusUpdate(user) {
    let $li = this.$el.find(".navigation__item--user");

    if (!user.id) {
      return $li.html($("<a />", {
        "class": "navigation__link",
        "href": "https://auth.lonelyplanet.com/users/sign_in"
      }).text("Sign In"));
    }

    $li.append(userPanelTemplate({
      user
    }));

    this.profileTabs = new Tabs({
      el: $(".navigation").find(".tabs")
    });
  }
  @subscribe("user.notifications.update")
  userNotificationUpdate(user) {
    this.userStatusUpdate(user);
  }
}

export default NavigationComponent;
