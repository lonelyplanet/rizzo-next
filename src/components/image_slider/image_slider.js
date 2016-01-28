import { Component } from "../../core/bane";
import $ from "jquery";
import "owlcarousel-pre/owl-carousel/owl.carousel.js";


/**
 * A component for creating an Image Slider
 */
export default class ImageSliderComponent extends Component {

  initialize(options) {
    options.afterMove = options.afterInit = options.afterUpdate = this.onUpdate;

    this.events = {
      "click .owl-next": "onNextClick",
      "click .owl-prev": "onPrevClick"
    };

    let $owlSlider = $(options.el).find('.owl-carousel').owlCarousel(options);
    this.slider = $owlSlider.data("owlCarousel");
  }

  onPrevClick(event) {
    event.preventDefault();
    this.slider.prev();
  }

  onNextClick(event) {
    event.preventDefault();
    this.slider.next();
  }

  onUpdate() {
    let last = (this.visibleItems.length + this.currentItem == this.itemsAmount),
        first = (this.currentItem == 0);

    if (last) {
      $(this.options.el + " .owl-next").hide();
    } else {
      $(this.options.el + " .owl-next").show();
    }

    if (first) {
      $(this.options.el + " .owl-prev").hide();
    } else {
      $(this.options.el + " .owl-prev").show();
    }
  }
}




