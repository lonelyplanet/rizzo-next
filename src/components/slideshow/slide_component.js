import { Component } from "../../core/bane";
import waitForTransition from "../../core/utils/waitForTransition";

class SlideComponent extends Component {

  static get imageSize(){
    if(Modernizr.mq("only screen and (min-width: 1200px)")){
      return "large";
    }

    if(Modernizr.mq("only screen and (min-width: 720px)")){
      return "medium";
    }

    return "small";
  }

  get imageUrl(){
    return this.model[SlideComponent.imageSize];
  }

  initialize(options){
    this.model = options.model;
    this.preloadPromise = {};
    if(!this.model) {
      throw new Error("Missing slide model");
    }
  }

  getElement(){
    let $el = this.currentEl = $("<div />", {
      "class": "slideshow__slide"
    });

    $el.css({
      "background-image": `url(${this.imageUrl})`
    }).attr("data-strapline", this.model.strapline);

    return $el;
  }

  preload(){
    // return if already preloaded
    if(this.preloadPromise[SlideComponent.imageSize]){
      return this.preloadPromise[SlideComponent.imageSize];
    }

    let promise = this.preloadPromise[SlideComponent.imageSize] = new Promise((resolve) => {
      let image = new Image();

      image.src = this.imageUrl;
      image.onload = function(){
        resolve();
      };
      image.onerror = function(){
        resolve();
      };
    });

    return promise;
  }

  show(){
    let $el = this.currentEl;

    $el.addClass("slideshow__slide--visible");

    return waitForTransition($el);
  }

  hide(){
    this.currentEl.remove();
  }

}

export default SlideComponent;
