import { Component } from "../../core/bane";
import Overlay from "../overlay";
import Notification from "../notification/notification";
import waitForTransition from "../../core/utils/waitForTransition";
import NavigationActions from "./navigation_actions";
import NavigationState from "./navigation_state";
import subscribe from "../../core/decorators/subscribe";
import matchMedia from "../../core/utils/matchMedia";
import breakpoints from "../../core/utils/breakpoints";

let userPanelTemplate = require("./user_panel.hbs");
let userAvatarTemplate = require("./user_avatar.hbs");
let signOutLinkTemplate = require("./sign_out_link.hbs");
let avatarMarkerTemplate = require("./avatar_marker.hbs");
let profileSettingsButtonTemplate = require("./profile_settings_button.hbs");

class NavigationComponent extends Component {
  initialize() {
    this.state = NavigationState.getState();
    this.overlay = new Overlay();
    this.cartUrl = "http://shop.lonelyplanet.com/cart/update";

    let notificationLabel = this.state.cartItemCount === 1 ? "item" : "items";

    this.notification = new Notification({
      target: this.$el.find(".js-cart-notification"),
      content: this.state.cartItemCount,
      className: "notification-badge--shop",
      label: `${this.state.cartItemCount} ${notificationLabel} in your cart`,
      href: this.cartUrl,
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

    this.updateShopUrl();

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

  /**
   * Change shop URL depending on if there are items in the cart
   */
  updateShopUrl() {
    const shopUrl = this.state.cartItemCount ?
      this.cartUrl :
      "http://shop.lonelyplanet.com/";

    $(".js-cart-notification")
      .find(".navigation__link")
      .attr("href", shopUrl);
  }

  @subscribe("user.status.update")
  userStatusUpdate(user) {
    let $li = this.$el.find(".navigation__item--user"),
        $liMobile = this.$mobileNavigation.find(".mobile-navigation__item--user");

    let $mobileNavigationHeader = this.$mobileNavigation.find(".js-mobile-navigation-header");

    if (!user.id) {
      if (this.showNewLoginLink()) {
        // lp.require is a way to detect if this is a legacy app or not (/¯◡ ‿ ◡)/¯ ~ ┻━┻
        const loginLink = window.lp.require ? "https://connect.lonelyplanet.com" : "#login";
        this.$el.find(".navigation__link[href*='sign_in']").attr("href", loginLink);
        this.$mobileNavigation.find(".mobile-navigation__link[href*='sign_in']").attr("href", loginLink);
      }
      return;
    }

    $li.html(userAvatarTemplate({
      user
    })).append(userPanelTemplate({
      className: "sub-navigation",
      user
    }));

    $liMobile.html(signOutLinkTemplate({
      user
    }));

    $mobileNavigationHeader.append(avatarMarkerTemplate({
      user
    })).append(profileSettingsButtonTemplate({
      user
    }));
  }
  @subscribe("user.notifications.update")
  userNotificationUpdate(user) {
    this.userStatusUpdate(user);
  }

  showNewLoginLink() {
    return document.cookie.indexOf("split-16-connect") > -1;
  }
}

export default NavigationComponent;
