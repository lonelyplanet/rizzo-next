import { Component } from "../../core/bane";
import $ from "jquery";

require("./tabs.scss");

export default class Tabs extends Component {
  get active() {
    return this._active;
  }
  set active($el) {
    $el = $($el);

    let $tab = this.$el.find($el.attr("href"));

    this.resetTabs();
    [$tab, $el].forEach((el) => el.addClass("is-active"));

    this._active = {
      $link: $el,
      $tab: $tab
    };
  }

  initialize() {
    this.events = {
      "click .tabs__links a": "activateTab"
    };

    this.$links = this.$el.find(".tabs__links a");
    this.$tabs = this.$el.find(".tabs__content");

    this.active = this.$links.first();
  }

  resetTabs() {
    ["$links", "$tabs"].forEach(($el) => this[$el].removeClass("is-active"));
  }

  activateTab(e) {
    e.preventDefault();
    this.active = e.target;

    this.trigger("tabs.activate", {
      index: this.$tabs.find(e.target).index()
    });
  }
}
