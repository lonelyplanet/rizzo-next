import { Component } from "../../core/bane";
import $ from "jquery";

class Footer extends Component {
  initialize() {
    this.updateLocationOnChange();
    this.$form = $(".js-newsletter-form");
    this.$form.on("submit", this.submit.bind(this));
    this.$success = $(".js-success");
  }

  updateLocationOnChange() {
    $(".js-language-select").on("change", function(event) {
      let url = "http://" + $(this).val();

      window.location = url;

      event.preventDefault();
    });
  }

  handleSubmitSuccess() {
    this.$form.addClass("is-hidden");
    this.$success.removeClass("is-hidden");
    if (typeof window !== "undefined" && window.dataLayer && Array.isArray(window.dataLayer)) {
      // shim for lp-analytics; importing the module seems to break rizzo (not this, rizzo-next, but legacy rizzo, which imports this)
      window.dataLayer.push({ event: "newsletter-subscribe" });
    }
  }

  submit(event) {
    event.preventDefault();
    $.post(this.$form.attr("action"), this.$form.serialize())
      .done(() => {
        this.handleSubmitSuccess();
      })
      .fail((xhr) => {
        if (xhr.status === 409) {
          this.handleSubmitSuccess();
        } else {
          console.log("error");
        }
      });
  }

}

export default Footer;
