import { Component } from "../../core/bane";
import Scroll from "scroll-js/dist/scroll";

class ScrollToComponent extends Component {
  initialize() {
    this.isSocialShareMenuHidden = false;

    this.events = {
      "click .js-action-scroll-to": "scrollLinkClicked"
    };

    this._scroll = new Scroll(document.body);
  }

  scrollLinkClicked(event) {
    event.preventDefault();

    let target = document.getElementById(event.currentTarget.hash.substr(1));
    this._scroll.toElement(target, {duration: 1500});
  }
}

export default ScrollToComponent;
