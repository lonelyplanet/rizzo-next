import { Component } from "../../core/bane";
import SearchComponent from "../search";
import NavigationComponent from "../navigation";
import $ from "jquery";

import debounce from "lodash/function/debounce";

/**
 * The page header which contains both search and navigation.
 * Clicking on the search icons opens the search.
 * Will re-render when the browser changes sizes
 */
class Header extends Component {

  initialize() {
    this.search = new SearchComponent();
    this.navigation = new NavigationComponent({
      el: $(".navigation")
    });

    this.events = {
      "click .js-lp-search": "onSearchClick",
      "click .js-lp-search .navigation__link": "onSearchClick",
      "click .js-menu": "onMobileMenuClick"
    };

    this.$search = this.$el.find(".header__search");
    this.$inner = this.$el.find(".header__inner");

    $(window).resize(debounce(this.render.bind(this), 100));
    this.render();
  }
  /**
   * Add a class to the search when it's too big for the screen
   * @return {Header} The instance of the header
   */
  render() {
    let fadeClassName = "header__search--fade";

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

  onMobileMenuClick(){
    this.navigation._clickNav();
  }
}

export default Header;
