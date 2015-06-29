import picturefill from "picturefill";
import { Component } from "../../core/bane";
import MastheadState from "./masthead_state";
import MastheadActions from "./masthead_actions";
import imagesLoaded from "imagesloaded/imagesloaded.pkgd.js";
import Strapline from "./strapline";
import Parallax from "./parallax";

class MastheadComponent extends Component {
  initialize(options) {
    this.name = "masthead";
    this.timeoutLength = options.timeoutLength || 6000;
    this.pictureTemplate = require("./picture.html.hbs");
    picturefill(); // polyfill for <picture>

    MastheadState.setInitialState(this.getInitialState());

    this.listenTo(MastheadState, "changed", this.imageChanged);
    this.listenTo(MastheadState, "preLooped", this.prepareLoop);
    this.listenTo(MastheadState, "looped", this.loopImages);

    this.strapline = new Strapline({
      el: this.$el.find(".masthead__text__straplines__strapline")
    });

    this.loadImages();

    // Turning off masthead... for now, sorry David
    if (false) {
      new Parallax({
        el: ".masthead__text",
        cutoff: options.parallax.cutoff,
        fadeChildren: options.parallax.fadeChildren,
        breakPoint: options.parallax.breakPoint
      });
    }
  }
  loadImages() {
    let images = MastheadState.getState().images.slice(1),
        imagesContainer = this.$el.find(".masthead__images"),
        compiledTemplate;

    if (!images || images.length === 0) return;

    // Take image data (from data-lp-initial-images on .masthead) and prepend each picture tag
    images.forEach((image) => {
      compiledTemplate = this.pictureTemplate(image);
      imagesContainer.prepend(compiledTemplate);
    });

    // When all images prepended are loaded, kickoff the transition events
    this.imageEls = imagesContainer.find(".masthead__images__image");
    imagesLoaded(this.imageEls, () => {
      this.startTimer();
    });
  }
  prepareLoop(data) {
    // Put the first image behind all the others (and make it visible) to provide looping effect
    this.imageEls.last().css("z-index", "1").removeClass("hidden");
    this.imageChanged(data);
  }
  loopImages(data) {
    // Show all images again (except for the last one)
    this.imageEls.not(":last").removeClass("hidden");

    // Reset the z-index of the last image to be back in its natural stacking context
    this.imageEls.last().css("z-index", "");

    this.imageChanged(data);
  }
  imageChanged(data) {
    // Hide the top image and transition the strapline
    this.imageEls.eq(data.currentIndex).addClass("hidden");
    this.strapline.next();

    this.startTimer();
  }
  advanceImage() {
    MastheadActions.advanceImage();
  }
  startTimer() {
    this._timer = setTimeout(this.advanceImage, this.timeoutLength);
  }
}

export default MastheadComponent;
