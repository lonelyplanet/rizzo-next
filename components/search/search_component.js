import { Arkham, Component } from "../../core/bane";
import Overlay from '../overlay';
import waitForTransition from "../../core/utils/waitForTransition";
import SearchActions from "./search_actions";
import SearchState from "./search_state";
import template from './search.hbs';
import './_search.scss';

import SearchItemComponent from "./search_item";

class SearchComponent extends Component {

  static get className() {
    return 'search';
  }

  get isOpen() {
    if(this._isOpen === undefined) {
      this._isOpen = false;
    }

    return this._isOpen;
  }

  set isOpen(val){
    this._isOpen = val || false;
  }

  get collection(){
    if(this._collection === undefined){
      this._collection = [];
    }

    return this._collection;
  }

  set collection(arr) {
    this._collection = arr;

    if(this._collection.length > 0) {
      this.$searchResults.addClass('search-results--visible');
    } else {
      this.$searchResults.removeClass('search-results--visible');
    }
  }

  initialize() {
    this.build();

    this.events = {
      "click .js-close": (e) => {
        e.preventDefault();

        this.hide();
      },

      "keydown .search__input": "onKeyup"
    };
    //$(document.body).on('keyup', this.onKeyup.bind(this));

    this.collection = [];
    this.overlay = new Overlay();

    this.listenTo(this.overlay, 'click', this.hide);

    SearchState.on("change:results", this.searchComplete.bind(this));
  }

  build(){
    this.$el = $(template());

    this.$input = this.$el.find('input');
    this.$searchResults = this.$el.find('.search-results');
    this.$list = this.$searchResults.find('.search-results__list');
    this.$resultsLink = this.$searchResults.find(".search-results__more");
  }

  show() {
    if(this.isOpen) {
      return;
    }

    this.isOpen = true;

    this.$el.appendTo(document.body);

    this.overlay.show();

    setTimeout(() => {
      this.$el.addClass(SearchComponent.className + '--visible');
    }, 10);

    return waitForTransition(this.$el)
      .then(() => {
        this.$input.focus();
      });
  }

  hide() {
    if(!this.isOpen) {
      return;
    }

    this.isOpen = false;

    this.$el.removeClass(SearchComponent.className + '--visible');

    this.overlay.hide();

    return waitForTransition(this.$el)
      .then(() => {
        this.$el.detach();
      });
  }

  searchComplete(data) {
    let collection = [];

    this.$list.empty();
    this.currentPosition = -1;

    this.$resultsLink.attr("href", "http://www.lonelyplanet.com/search?q=" + this.$input.val());

    data.results.forEach((model) => {
      collection.push(this.addOne(model));
    });

    this.collection = collection;
  }

  onKeyup(e) {
    if(!this.isOpen){
     return;
    }

    switch(e.keyCode){
      case 13:
        // enter
        if(this.currentPosition !== -1){
          this.collection[this.currentPosition].navigate();
          break;
        }

        window.location.href = `http://www.lonelyplanet.com/search?q=${this.$input.val()}`;
        break;

      case 27:
        // esc
        this.hide();
        break;

      case 38:
        //up
        e.preventDefault();
        this.goUp();
        break;

      case 40:
        //down
        e.preventDefault();
        this.goDown();
        break;

      default:
        clearTimeout(this.searchTimer);

        this.searchTimer = window.setTimeout(() => {
          SearchActions.typing({
            query: this.$input.val()
          });
        }, 200);

        break;
    }
  }

  goUp() {
    this.currentPosition--;

    if(this.currentPosition < 0) {
      this.currentPosition = 0;
      return;
    }

    let currentItem = this.collection[this.currentPosition];

    this.collection.forEach((itemComponent) => {
      itemComponent.unselect();
    });

    currentItem.select();
  }

  goDown() {
    this.currentPosition++;

    if(this.currentPosition >= this.collection.length) {
      this.currentPosition = this.collection.length -1;
    }

    let currentItem = this.collection[this.currentPosition];

    this.collection.forEach((itemComponent) => {
      itemComponent.unselect();
    });

    currentItem.select();
  }

  addOne(model) {
    let itemComponent = new SearchItemComponent({
      model: model,
      searchString: this.$input.val()
    });

    itemComponent.render().$el.appendTo(this.$list);

    return itemComponent;
  }

}

export default SearchComponent;
