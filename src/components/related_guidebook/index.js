import { Component } from "../../core/bane";
import $clamp from "clamp-js/clamp.js";
import $ from "jquery";
import debounce from "lodash/debounce";

import "./related_guidebook.scss";

class RelatedGuidebookComponent extends Component {
  initialize() {
    if (!$("html").hasClass("ie9")) {
      this._clampText();

      $(window).resize(debounce(this._reclamp.bind(this), 100));
    }
  }

  _reclamp() {
    this._clampText();
  }

  _clampText() {
    this.$el.each((index, guidebook) => {
      $clamp($(guidebook).find(".js-related-guidebook-title").get(0), { clamp: 2 });
      $clamp($(guidebook).find(".js-related-guidebook-content").get(0), { clamp: 2 });
    });
  }
}

export default RelatedGuidebookComponent;
