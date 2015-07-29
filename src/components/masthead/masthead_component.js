import { Component } from "../../core/bane";
import waitForTransition from "../../core/utils/waitForTransition";
import Overlay from "../overlay";
import SlideComponent from "./slide_component";

/**
 * Masthead Component
*/
export default class MastheadComponent extends Component {
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
      this._$images = this.$el.find(".masthead__images");
      this._$images.empty();
    }

    return this._$images;
  }

  get $straplines() {
    return this.$el.find(".masthead__strapline");
  }

  get type(){
    return this.options.type || "fade";
  }

  initialize(options){
    this.options = options;
    this.$el.addClass(`masthead--${this.type}`);
    this.currentSlideIndex = 0;
    this.overlay = new Overlay();

    this.events = {
      "click [class*=\"--num_-1\"]": "goLeft",
      "click [class*=\"--num_1\"]": "goRight",
      "click .js-play-video": "playVideo"
    };

    this.createBaseSlides();

    if(this.slides.length > 1) {
      this.initSlideShow();
      this.startLoop();
    }

    // import Video from "../video";
    require([
        "../video"
      ], (Video) => {
        Video.addPlayer(document.body)
          .then(this.playerReady.bind(this));
      });
  }

  /**
   * Play the video, callback from click handler
   */
  playVideo() {
    this.overlay.show();
    this.player.play(this.videoId);
  }

  /**
   * Callback from the player load event
   * @param  {VideoPlayer} player Instance of the VideoPlayer
   * @listens {play}
   */
  playerReady(player) {
    this.player = player;

    this.player.search(window.lp.place.atlasId)
      .then(this.searchDone.bind(this));

    this.listenTo(this.player, "play", this.onPlay);
    this.listenTo(this.player, "stop", this.onStop);
    this.listenTo(this.player, "pause", this.onStop);
  }

  onPlay() {
    // Use this?
  }

  onStop() {
    // Use?
    this.overlay.hide();
  }

  searchDone(videos) {
    if (videos.length) {
      this.$el.find(".js-play-video").show();
      this.videoId = videos[0];
    }
  }

  createBaseSlides() {
    let state = this.getInitialState();
    let hasStraplines = false;

    state.images.forEach((imageData) => {
      let slide = new SlideComponent({
        model: imageData
      });

      if(imageData.strapline) {
        hasStraplines = true;
      }

      this.slides.push(slide);
    });

    if(!hasStraplines) {
      this.$el.find(".masthead__straplines").remove();
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

    this.setCssClasses();
  }

  startLoop() {
    return new Promise((resolve) => {
        this.loopTimer = setTimeout(resolve, MastheadComponent.loopSpeed);
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
    let arr = [];

    for(var i = -this.padding; i <= this.padding; i++) {
      arr.push(this.getSlideFromIndex(i));
    }

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
      $el.attr("class", "masthead__slide masthead__slide--num_" + i++);
    });
  }

  showNext({ reverse = false } = {}){
    let currentIndex = this.currentSlideIndex = reverse ?
      this.getPrevIndex(this.currentSlideIndex) :
      this.getNextIndex(this.currentSlideIndex);

    let state = this.getNewState();

    this.isAnimating = true;

    // remove first/last element of stack, [0,1,2,3] -> [1,2,3]
    var toBeRemoved = reverse ? this.stack.pop() : this.stack.shift();

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
    this.$straplines.removeClass("masthead__strapline--visible");
    this.$straplines
      .eq(index)
      .addClass("masthead__strapline--visible");
  }

}
