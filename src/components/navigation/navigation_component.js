import Component from "../../core/component";
import Overlay from "../overlay";
import Notification from "../notification/notification";
import waitForTransition from "../../core/utils/waitForTransition";
import NavigationActions from "./navigation_actions";
import NavigationState from "./navigation_state";
import subscribe from "../../core/decorators/subscribe";
import matchMedia from "../../core/utils/matchMedia";
import breakpoints from "../../core/utils/breakpoints";

let userPanelTemplate = require("./user_panel.hbs"),
    userAvatarTemplate = require("./user_avatar.hbs"),
    userLinkTemplate = require("./user_link.hbs");

class NavigationComponent extends Component {

  initialize() {

    this.state = NavigationState.getState();
    this.overlay = new Overlay();

    let notificationLabel = this.state.cartItemCount === 1 ? "item" : "items";

    this.notification = new Notification({
      target: this.$el.find(".js-cart-notification"),
      content: this.state.cartItemCount,
      className: "notification-badge--shop",
      label: `${this.state.cartItemCount} ${notificationLabel} in your cart`
    });

    matchMedia(`(min-width: ${breakpoints.min["720"]})`, (query) => {
      if (query.matches) {
        this.notification.$el.find(".js-notification-badge")
          .removeClass("notification-badge--shop-inline")
          .addClass("notification-badge--shop");
      } else {
        this.notification.$el.find(".js-notification-badge")
          .removeClass("notification-badge--shop")
          .addClass("notification-badge--shop-inline")
          .text("");
      }
    });

    this.name = "navigation";
    this.$mobileNavigation = this.$el.find(".mobile-navigation").detach();
    this.$mobileNavigation.removeClass("mobile-navigation--hidden");
    this.$mobileNavigation.on("click", ".js-close", this._clickNav.bind(this));
    this.$mobileNavigation.on("click", ".js-nav-item", this._handleClick.bind(this));

    this.$el.on("touchstart", ".js-nav-item", this._handleClick.bind(this));

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

  _handleClick(e) {
    let $target = $(e.currentTarget);

    $target.hasClass("navigation__item") ? this._handleSubNav($target[0]) : this._handleMobileSubNav($target[0]);

    if (
      $target.find(".mobile-sub-navigation").length &&
      !$(e.target).hasClass("sub-navigation__link") &&
      !$(e.target).closest("a").hasClass("sub-navigation-feature")
    ) {
      e.preventDefault();
    }
  }

  _handleMobileSubNav(el) {
    let $navItem = $(el).find(".mobile-sub-navigation");

    if ( $(".is-expanded").length && !$navItem.hasClass("is-expanded") ) {
      this.$mobileNavigation.find(".mobile-sub-navigation").removeClass("is-expanded");
      this.$mobileNavigation.find(".js-nav-item").removeClass("clicked");
    }

    $(el).toggleClass("clicked");
    $navItem.toggleClass("is-expanded");
  }

  _handleSubNav(el) {
    if ($(el).find(".sub-navigation").hasClass("sub-navigation--visible")) {
      this._closeSubNav(el);
    } else {
      this._openSubNav(el);
    }
  }

  _openSubNav(el) {
    clearTimeout(this.hideTimer);

    // Always clear the currently active one
    this.$el.find(".sub-navigation").removeClass("sub-navigation--visible");

    this.showTimer = setTimeout(() => {
      $(el).find(".sub-navigation").addClass("sub-navigation--visible");
    }, 0);
  }

  _closeSubNav(el) {
    clearTimeout(this.showTimer);

    this.hideTimer = setTimeout(() => {
      $(el).find(".sub-navigation").removeClass("sub-navigation--visible");
    }, 100);
  }

  handleHover() {
    this.$el.on("mouseenter", ".js-nav-item", (e) => this._openSubNav(e.currentTarget));
    this.$el.on("mouseleave", ".js-nav-item", (e) => this._closeSubNav(e.currentTarget));
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
    let $li = this.$el.find(".navigation__item--user"),
        $liMobile = this.$mobileNavigation.find(".mobile-navigation__item--user");

    if (!user.id) {
      return;
    }

    $li.html(userAvatarTemplate({
      user
    })).append(userPanelTemplate({
      className: "sub-navigation",
      user
    }));

    $liMobile.html(userLinkTemplate({
      user
    })).append(userPanelTemplate({
      className: "mobile-sub-navigation",
      user
    }));
  }
  @subscribe("user.notifications.update")
  userNotificationUpdate(user) {
    this.userStatusUpdate(user);
  }
}

export default NavigationComponent;
