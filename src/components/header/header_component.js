import { Component } from "../../core/bane";
import SearchComponent from "../search";
import NavigationComponent from "../navigation";

import debounce from "lodash/function/debounce";

class Header extends Component {

  initialize() {
    this.search = new SearchComponent();
    this.navigation = new NavigationComponent({
      el: ".navigation"
    });

    this.events = {
      "click .js-search": "onSearchClick",
      "click .js-search .navigation__link": "onSearchClick",
      "click .js-menu": "onMobileMenuClick"
    };

    this.$search = this.$el.find(".header__search");
    this.$inner = this.$el.find(".header__inner");

    $(window).resize(debounce(this.render.bind(this), 100));
    this.render();
  }

  render(){
    let fadeClassName = "header__search--fade";

    this.$search.removeClass(fadeClassName);

    let isToBig = this.$search.width() > this.$inner.width() * .42;

    this.$search.toggleClass(fadeClassName, isToBig);
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
