import { Component } from "../../core/bane";
import waitForTransition from "../../core/utils/waitForTransition";
import SlideComponent from "./slide_component";
import uniq from "lodash/array/uniq";

/**
 * slideshow Component
*/
export default class Slideshow extends Component {
  static get loopSpeed() {
    return 6000;
  }

  get padding() {
    return this.type === "slide" ? 2 : 1;
  }

  get slides(){
    return this._slides || (this._slides = []);
  }

  get stack(){
    return this._stack || (this._stack = []);
  }

  get $images(){
    if(!this._$images) {
      this._$images = this.$el.find(".slideshow__images");

      if (!this._$images.length) {
        this._$images = $("<div />", {
          "class": "slideshow__images"
        }).appendTo(this.$el);
      }

      this._$images.empty();
    }

    return this._$images;
  }

  

  get type(){
    return this.options.type || "fade";
  }

  initialize(options){
    this.options = options;
    this.$el.addClass(`slideshow--${this.type}`);
    this.currentSlideIndex = 0;

    this.events = {
      "click [class*=\"--num_-1\"]": "goLeft",
      "click [class*=\"--num_1\"]": "goRight"
    };

    let state = this.getInitialState();

    if (!state.images && !this.options.images) {
      return;
    }

    this.createBaseSlides(state);
    this.initSlideShow();

    if(this.slides.length > 1) {
      this.setCssClasses();
      this.startLoop();
    }
  }

  createBaseSlides(state) {
    

    let images = state.images || this.options.images || [];

    let hasStraplines = false;

    images.forEach((imageData) => {
      let slide = new SlideComponent({
        model: imageData
      });

      if(imageData.strapline) {
        hasStraplines = true;
      }

      this.slides.push(slide);
    });

    if(!hasStraplines) {
      this.$el.find(".slideshow__straplines").remove();
    }

    if (this.options.showProgress && images.length > 1) {
      this.makeProgress();
    }
  }

  initSlideShow() {
    let state = this.getNewState();

    this.showStraplineByIndex(this.currentSlideIndex);

    state.forEach((index) => {
      let $el = this.slides[index].getElement();

      this.stack.push($el);

      $el.appendTo(this.$images);
    });

    if (this.options.height) {
      this.$el.height(this.options.height);
    }
  }

  startLoop() {
    return new Promise((resolve) => {
        this.loopTimer = setTimeout(resolve, Slideshow.loopSpeed);
      })
      .then(() => {
        return this.showNext();
      })
      .then(this.startLoop.bind(this));
  }

  goRight(){
    if(this.isAnimating){
      return Promise.all([]);
    }

    clearTimeout(this.loopTimer);

    return this.showNext()
      .then(this.startLoop.bind(this));
  }

  goLeft(){
    if(this.isAnimating){
      return Promise.all([]);
    }

    clearTimeout(this.loopTimer);

    return this.showNext({ reverse: true})
      .then(this.startLoop.bind(this));
  }

  getNewState() {
    if (this.slides.length === 1) {
      return [0];
    }

    let arr = [];

    for(let i = -this.padding; i <= this.padding; i++) {
      arr.push(this.getSlideFromIndex(i));
    }

    // E.G., make sure if the array has [0,0,0], it only returns [0]
    return arr;
  }

  // TODO: Fix double overflow (more then one circle)
  getSlideFromIndex(index){
    let currentIndex = this.currentSlideIndex;
    let nextIndex = currentIndex + index;
    let output = nextIndex;

    if(nextIndex < 0) {
      output = (this.slides.length) + currentIndex + index;
    }

    if(nextIndex > this.slides.length - 1){
      output = nextIndex - (this.slides.length);
    }

    if(output < 0 || output >= this.slides.length) {
      return 0;
    }

    return output;
  }

  setCssClasses() {
    let i = -this.padding;

    this.stack.forEach(($el) => {
      $el.attr("class", "slideshow__slide slideshow__slide--num_" + i++);
    });

    if (this.options.showProgress) {
      this.updateProgress();
    }
  }

  showNext({ reverse = false } = {}){
    let currentIndex = this.currentSlideIndex = reverse ?
      this.getPrevIndex(this.currentSlideIndex) :
      this.getNextIndex(this.currentSlideIndex);

    let state = this.getNewState();

    this.isAnimating = true;

    // remove first/last element of stack, [0,1,2,3] -> [1,2,3]
    let toBeRemoved = reverse ? this.stack.pop() : this.stack.shift();

    // add new item to stack, [1,2,3] -> [1,2,3,4]
    let nextIndexIn = reverse ? state[0] : state[state.length - 1];
    let nextSlide = this.slides[nextIndexIn];
    let nextEl = nextSlide.getElement();

    if(reverse){
      this.stack.unshift(nextEl);
    } else {
      this.stack.push(nextEl);
    }

    // preLoad new image before animating
    return nextSlide.preload()
      .then(() => {
        // remove old element
        $(toBeRemoved[0]).remove();

        // insert new element
        nextEl.appendTo(this.$images);

        // reset all css classes on stack for positioning / animation
        this.setCssClasses();
      })
      .then(() => {
        this.showStraplineByIndex(currentIndex);
      })
      .then(() => {
        // 5. wait for slide animation on primary slide
        return waitForTransition(this.stack[this.padding]);
      })
      .then(() => {
        this.isAnimating = false;
      });
  }

  getPrevIndex(index){
    let prevIndex = index - 1;

    if(prevIndex < 0) {
      prevIndex = this.slides.length - 1;
    }

    return prevIndex;
  }

  getNextIndex(index){
    let nextIndex = index + 1;

    if(nextIndex > this.slides.length - 1) {
      nextIndex = 0;
    }

    return nextIndex;
  }

  showStraplineByIndex(index){
    this.trigger("image.changed", {
      index
    });
  }

  makeProgress() {
    this.$progress = $("<div />", {
      "class": "slideshow__progress"
    });

    this.slides.forEach(() => {
      this.$progress.append($("<span />", {
        "class": "slideshow__progress__dot"
      }));
    });

    this.$images.append(this.$progress);
  }

  updateProgress() {
    let $dots = this.$progress.find(".slideshow__progress__dot");
      
    $dots.removeClass("slideshow__progress__dot--active");

    $dots.eq(this.currentSlideIndex).addClass("slideshow__progress__dot--active");
  }

}
