import { Component } from "../../core/bane";
import $ from "jquery";

class Footer extends Component {
  initialize() {
    this.updateLocationOnChange();
    this.$form = $(".js-newsletter-form");
    this.$submitButton = $(".js-submit");
    this.$success = $(".js-success");
    this.$submitButton.on("click", this.submit.bind(this));
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
