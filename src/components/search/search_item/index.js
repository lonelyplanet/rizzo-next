import { Component } from "../../../core/bane";
import highlight from "../../../core/utils/highlight";
import template from "./index.html.hbs";
import "./index.scss";

class SearchItemComponent extends Component {

  initialize(options){
    this.model = options.model;
    this.searchString = options.searchString;
    this.$el = $("<li />", {
      "class": "search-item"
    });
  }

  render(){
    this.$el.html(template(this.model));

    highlight(this.$el.find("[class*='__name']"), this.searchString);

    return this;
  }

  select(){
    this.$el.addClass("search-item--selected");
  }

  unselect() {
    this.$el.removeClass("search-item--selected");
  }

  navigate(){
    window.location = "/" + this.model.slug;
  }

}

export default SearchItemComponent;
