import { Component } from "../../../core/bane";
import highlight from "../../../core/utils/highlight";
import template from "./index.html.hbs";

require("../../topic/_topic.scss");

class SearchItemComponent extends Component {

  initialize(options){
    this.model = options.model;
    this.model.isVideo = this.model.type === "video";
    this.searchString = options.searchString;
    this.$el = $("<li />", {
      "class": "lp-search-item"
    });
  }

  render(){
    this.$el.html(template(this.model));

    highlight(this.$el.find("[class*='__name']"), this.searchString);

    return this;
  }

  select(){
    this.$el.addClass("lp-search-item--selected");
  }

  unselect() {
    this.$el.removeClass("lp-search-item--selected");
  }

  navigate(){
    window.location = "/" + this.model.slug;
  }

}

export default SearchItemComponent;
