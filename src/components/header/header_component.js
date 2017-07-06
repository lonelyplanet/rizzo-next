import { Component } from "../../core/bane";
import CookieUtil from "../../core/cookie_util";
import SearchComponent from "../search";
import NavigationComponent from "../navigation";
import NavigationState from "../navigation/navigation_state";
import $ from "jquery";
import debounce from "lodash/debounce";

/**
 * The page header which contains both search and navigation.
 * Clicking on the search icons opens the search.
 * Will re-render when the browser changes sizes
 */
class Header extends Component {

  initialize(options) {
    this.lazyLoadGlobalComponents = this.lazyLoadGlobalComponents.bind(this);
    this.state = NavigationState.getState();
    this.search = new SearchComponent();
    this.navigation = new NavigationComponent({
      el: $(".navigation")
    });

    this.events = {
      "click .js-lp-global-header-search": "onSearchClick",
      "click .js-lp-global-header-search .navigation__link": "onSearchClick",
      "click .js-menu": "onMobileMenuClick"
    };

    this.$search = this.$el.find(".js-lp-global-header-search");
    this.$inner = this.$el.find(".js-lp-global-header-inner");

    $(window).resize(debounce(this.render.bind(this), 100));
    this.render();

    this.$mobileNotificationBadge = require("./mobile_notification_badge.hbs");

    this.appendMenuIcon();
    this.buildGlobalComponents(options);

    this.cookieUtil = new CookieUtil();
  }

  buildGlobalComponents(options = {}) {
    this.lazyLoadGlobalComponents(options);

    $(document).on("touchstart", "a[href*='login']", () => {
      this.navigation._clickNav();
    });
  }

  lazyLoadGlobalComponents(options) {
    require.ensure([], (require) => {
      const render = require("@lonelyplanet/dotcom-core/dist/classes/runtime").default;

      const modal = document.createElement("div");
      modal.id = "lp-global-modal-login";
      document.body.appendChild(modal);

      render({
        component: "GlobalLogin",
        el: modal,
        props: options,
      });

      const toast = document.createElement("div");
      toast.id = "lp-global-toast";
      document.body.appendChild(toast);

      const toastData = this.cookieUtil.getCookie("lpToast");
      const toastDuration = 3000;
      const animationDuration = 200;

      if (toastData) {
        const data = JSON.parse(toastData);

        render({
          component: "GlobalToast",
          el: toast,
          props: {
            title: data.title,
            message: data.message,
            type: data.type,
            duration: toastDuration,
            animationDuration,
            onClose: () => {
              this.cookieUtil.removeCookie("lpToast");

              setTimeout(() => {
                document.body.removeChild(toast);
              }, animationDuration);
            },
          },
        });
      }
    }, "rizzo_next_global_components");
  }

  /**
   * Add a class to the search when it's too big for the screen
   * @return {Header} The instance of the header
   */
  render() {
    let fadeClassName = "lp-global-header__search--fade";

    this.$search
        .removeClass(fadeClassName)
        .toggleClass(fadeClassName, this.isTooBig());

    return this;
  }
  /**
   * If the search box is too big based on the screen width
   * @return {Boolean}
   */
  isTooBig() {
    return this.$search.width() > this.$inner.width() * .42;
  }

  onSearchClick(e) {
    e.preventDefault();

    this.search.show();
  }

  onMobileMenuClick(e){
    e.preventDefault();

    this.navigation._clickNav();
  }

  appendMenuIcon() {
    if(this.state.cartItemCount) {
      $(".js-lp-global-header-mobile").prepend(this.$mobileNotificationBadge);
    }
  }
}

export default Header;
