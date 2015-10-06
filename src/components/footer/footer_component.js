import { Component } from "../../core/bane";
import $ from "jquery";

class Footer extends Component {
  initialize() {
    this.updateLocationOnChange();
  }

  updateLocationOnChange() {
    $(".js-language-select").on("change", function(event) {
      let url = "http://" + $(this).val();

      window.location = url;

      event.preventDefault();
    });
  }
}

export default Footer;
