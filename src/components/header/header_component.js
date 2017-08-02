import { Component } from "../../core/bane";
import SearchComponent from "../search";
import NavigationComponent from "../navigation";
import NavigationState from "../navigation/navigation_state";
import subscribe from "../../core/decorators/subscribe";
import $ from "jquery";
import debounce from "lodash/debounce";
import BetaBannerComponent from "../beta_banner/beta_banner_component";

/**
 * The page header which contains both search and navigation.
 * Clicking on the search icons opens the search.
 * Will re-render when the browser changes sizes
 */
class Header extends Component {

  initialize() {
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
    this.buildGlobalComponents();


    this.subscribe();
  }

  buildGlobalComponents() {
    $(document).on("touchstart", "a[href*='login']", () => {
      this.navigation._clickNav();
    });
  }

  @subscribe("user.status.update")
  showBetaBanner(user) {
    if(this.hasVariantCookie(user.variant) && !this.$betaBanner) {
      this.$betaBanner = new BetaBannerComponent();
      this.$betaBanner.render();
    }
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

  /**
   * If in variant group then show the beta banner
   * @return {Boolean}
   */
  hasVariantCookie(variant) {
    // Hard coding the specfic cookier for now just to make sure
    // to not interfere with other tests going on
    return document.cookie.indexOf(variant) > -1;
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
