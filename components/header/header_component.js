import { Component } from "../../core/bane";
import SearchComponent from '../search';
import NavigationComponent from "../navigation";

class Header extends Component {

  initialize() {
    this.search = new SearchComponent();
    this.navigation = new NavigationComponent({
      el: ".navigation"
    });

    this.events = {
      'click .js-search': 'onSearchClick',
      'click .js-search .navigation__link': 'onSearchClick',
      'click .js-menu': 'onMobileMenuClick'
    };

    //this.$el.find('.navigation__item.js-search .navigation__link', this.onSearchClick.bind(this));
  }

  onSearchClick(e) {
    e.preventDefault();

    this.search.show();
  }

  onMobileMenuClick(e){
    this.navigation._clickNav();
  }
}

export default Header;
