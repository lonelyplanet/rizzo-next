import { Component } from "../../core/bane";
import imagesLoaded from "imagesloaded";
import $ from "jquery";

export default class ImageGalleryComponent extends Component {
  initialize(options) {
    console.log("ImageGallery loaded");

    // callback
    this.options.onInit(this);

    let self = this;
    // init masonry after all images are loaded
    imagesLoaded( this.gridEl, function() {
      // initialize masonry
      new Masonry(self.gridEl, {
        itemSelector: ".grid__item",
        isFitWidth : true
      });
      // show grid after all images (thumbs) are loaded
      // classie.add(self.gridEl, "grid--loaded");
      $(self.gridEl).addClass("grid--loaded");
      // init/bind events
      self._initEvents();
      // create the large image and append it to the DOM
      self._setOriginal();
      // create the clone image and append it to the DOM
      self._setClone();
    });
  }

  _throttle(fn, delay) {
    let allowSample = true;

    return function(e) {
      if (allowSample) {
        allowSample = false;
        setTimeout(function() { allowSample = true; }, delay);
        fn(e);
      }
    };
  }

  _nextSibling(el) {
    let nextSibling = el.nextSibling;

    while(nextSibling && nextSibling.nodeType !== 1) {
      nextSibling = nextSibling.nextSibling
    }

    return nextSibling;
  }

  _extend(a, b) {
    for(let key in b) {
      if(b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }

    return a;
  }

  /**
   * GridFx obj
   */
  // function GridFx(el, options) {
  contructor(el, options) {
    this.gridEl = el;
    this.options = self._extend({}, this.options);
    self._extend(this.options, options);

    this.items = [].slice.call(this.gridEl.querySelectorAll(".grid__item"));
    this.previewEl = self._nextSibling(this.gridEl);
    this.isExpanded = false;
    this.isAnimating = false;
    this.closeCtrl = this.previewEl.querySelector("button.action--close");
    this.previewDescriptionEl = this.previewEl.querySelector(".description--preview");

    this._init();
  }

  /**
   * options
   */
  // GridFx.prototype.options = {
  options() {
    return {
      pagemargin: 0,
      // x and y can have values from 0 to 1 (percentage). If negative then it means the alignment is left and/or top rather than right and/or bottom
      // so, as an example, if we want our large image to be positioned vertically on 25% of the screen and centered horizontally the values would be x:1,y:-0.25
      imgPosition: { x : 1, y : 1 },
      onInit: function(instance) { return false; },
      onResize: function(instance) { return false; },
      onOpenItem: function(instance, item) { return false; },
      onCloseItem: function(instance, item) { return false; },
      onExpand: function() { return false; }
    };
  };

  /*GridFx.prototype._init = function() {
    // callback
    this.options.onInit(this);

    let self = this;
    // init masonry after all images are loaded
    imagesLoaded( this.gridEl, function() {
      // initialize masonry
      new Masonry(self.gridEl, {
        itemSelector: ".grid__item",
        isFitWidth : true
      });
      // show grid after all images (thumbs) are loaded
      // classie.add(self.gridEl, "grid--loaded");
      $(self.gridEl).addClass("grid--loaded");
      // init/bind events
      self._initEvents();
      // create the large image and append it to the DOM
      self._setOriginal();
      // create the clone image and append it to the DOM
      self._setClone();
    });
  };*/

  /**
   * initialize/bind events
   */
  // GridFx.prototype._initEvents = function () {
  _initEvents() {
    let self = this,
        clickEvent = (document.ontouchstart!==null ? "click" : "touchstart");

    this.items.forEach(function(item) {
      let touchend = function(ev) {
          ev.preventDefault();
          self._openItem(ev, item);
          item.removeEventListener("touchend", touchend);
        },
        touchmove = function(ev) {
          item.removeEventListener("touchend", touchend);
        },
        manageTouch = function() {
          item.addEventListener("touchend", touchend);
          item.addEventListener("touchmove", touchmove);
        };

      item.addEventListener(clickEvent, function(ev) {
        if(clickEvent === "click") {
          ev.preventDefault();
          self._openItem(ev, item);

        } else {
          manageTouch();

        }
      });
    });

    // close expanded image
    this.closeCtrl.addEventListener("click", function() {
      self._closeItem();
    });

    window.addEventListener("resize", self._throttle(function(ev) {
      // callback
      self.options.onResize(self);
    }, 10));
  }

  /**
   * open a grid item
   */
  // GridFx.prototype._openItem = function(ev, item) {
  _openItem(ev, item) {
    if( this.isAnimating || this.isExpanded ) return;
    this.isAnimating = true;
    this.isExpanded = true;

    // item's image
    let gridImg = item.querySelector("img"),
        gridImgOffset = gridImg.getBoundingClientRect();

    // index of current item
    this.current = this.items.indexOf(item);

    // set the src of the original image element (large image)
    this._setOriginal(item.querySelector("a").getAttribute("href"));

    // callback
    this.options.onOpenItem(this, item);

    // set the clone image
    this._setClone(gridImg.src, {
      width : gridImg.offsetWidth,
      height : gridImg.offsetHeight,
      left : gridImgOffset.left,
      top : gridImgOffset.top
    });

    // hide original grid item
    // classie.add(item, "grid__item--current");
    $(item).addClass("grid__item--current");

    // calculate the transform value for the clone to animate to the full image view
    let win = this._getWinSize(),
        originalSizeArr = item.getAttribute("data-size").split("x"),
        originalSize = {width: originalSizeArr[0], height: originalSizeArr[1]},
        dx = ((this.options.imgPosition.x > 0 ? 1-Math.abs(this.options.imgPosition.x) : Math.abs(this.options.imgPosition.x)) * win.width + this.options.imgPosition.x * win.width/2) - gridImgOffset.left - 0.5 * gridImg.offsetWidth,
        dy = ((this.options.imgPosition.y > 0 ? 1-Math.abs(this.options.imgPosition.y) : Math.abs(this.options.imgPosition.y)) * win.height + this.options.imgPosition.y * win.height/2) - gridImgOffset.top - 0.5 * gridImg.offsetHeight,
        z = Math.min( Math.min(win.width*Math.abs(this.options.imgPosition.x) - this.options.pagemargin, originalSize.width - this.options.pagemargin)/gridImg.offsetWidth, Math.min(win.height*Math.abs(this.options.imgPosition.y) - this.options.pagemargin, originalSize.height - this.options.pagemargin)/gridImg.offsetHeight );

    // apply transform to the clone
    this.cloneImg.style.WebkitTransform = "translate3d(" + dx + "px, " + dy + "px, 0) scale3d(" + z + ", " + z + ", 1)";
    this.cloneImg.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0) scale3d(" + z + ", " + z + ", 1)";

    // add the description if any
    let descriptionEl = item.querySelector(".description");
    if(descriptionEl) {
      this.previewDescriptionEl.innerHTML = descriptionEl.innerHTML;
    }

    let self = this;
    setTimeout(function() {
      // controls the elements inside the expanded view
      // classie.add(self.previewEl, "preview--open");
      $(self.previewEl).addClass("preview--open");
      // callback
      self.options.onExpand();
    }, 0);

    // after the clone animates..
    onEndTransition(this.cloneImg, function() {
      // when the original/large image is loaded..
      imagesLoaded(self.originalImg, function() {
        // close button just gets shown after the large image gets loaded
        // classie.add(self.previewEl, "preview--image-loaded");
        $(self.previewEl).addClass("preview--image-loaded");
        // animate the opacity to 1
        self.originalImg.style.opacity = 1;
        // and once that's done..
        onEndTransition(self.originalImg, function() {
          // reset cloneImg
          self.cloneImg.style.opacity = 0;
          self.cloneImg.style.WebkitTransform = "translate3d(0,0,0) scale3d(1,1,1)";
          self.cloneImg.style.transform = "translate3d(0,0,0) scale3d(1,1,1)";

          self.isAnimating = false;
        });

      });
    });
  }

  /**
   * create/set the original/large image element
   */
  // GridFx.prototype._setOriginal = function(src) {
  _setOriginal(src) {
    if( !src ) {
      this.originalImg = document.createElement("img");
      this.originalImg.className = "original";
      this.originalImg.style.opacity = 0;
      this.originalImg.style.maxWidth = "calc(" + parseInt(Math.abs(this.options.imgPosition.x)*100) + "vw - " + this.options.pagemargin + "px)";
      this.originalImg.style.maxHeight = "calc(" + parseInt(Math.abs(this.options.imgPosition.y)*100) + "vh - " + this.options.pagemargin + "px)";
      // need it because of firefox
      this.originalImg.style.WebkitTransform = "translate3d(0,0,0) scale3d(1,1,1)";
      this.originalImg.style.transform = "translate3d(0,0,0) scale3d(1,1,1)";
      src = "";
      this.previewEl.appendChild(this.originalImg);
    }

    this.originalImg.setAttribute("src", src);
  }

  /**
   * create/set the clone image element
   */
  // GridFx.prototype._setClone = function(src, settings) {
  _setClone(src, settings) {
    if( !src ) {
      this.cloneImg = document.createElement("img");
      this.cloneImg.className = "clone";
      src = "";
      this.cloneImg.style.opacity = 0;
      this.previewEl.appendChild(this.cloneImg);
    }
    else {
      this.cloneImg.style.opacity = 1;
      // set top/left/width/height of grid item's image to the clone
      this.cloneImg.style.width = settings.width  + "px";
      this.cloneImg.style.height = settings.height  + "px";
      this.cloneImg.style.top = settings.top  + "px";
      this.cloneImg.style.left = settings.left  + "px";
    }

    this.cloneImg.setAttribute("src", src);
  }

  /**
   * closes the original/large image view
   */
  // GridFx.prototype._closeItem = function() {
  _closeItem() {
    if( !this.isExpanded || this.isAnimating ) return;
    this.isExpanded = false;
    this.isAnimating = true;

    // the grid item's image and its offset
    let gridItem = this.items[this.current],
        gridImg = gridItem.querySelector("img"),
        gridImgOffset = gridImg.getBoundingClientRect(),
        self = this;

    // classie.remove(this.previewEl, "preview--open");
    // classie.remove(this.previewEl, "preview--image-loaded");
    $(this.previewEl).removeClass("preview--open");
    $(this.previewEl).removeClass("preview--image-loaded");

    // callback
    this.options.onCloseItem(this, gridItem);

    // large image will animate back to the position of its grid's item
    // classie.add(this.originalImg, "animate");
    $(this.originalImg).addClass("animate");

    // set the transform to the original/large image
    let win = this._getWinSize(),
        dx = gridImgOffset.left + gridImg.offsetWidth/2 - ((this.options.imgPosition.x > 0 ? 1-Math.abs(this.options.imgPosition.x) : Math.abs(this.options.imgPosition.x)) * win.width + this.options.imgPosition.x * win.width/2),
        dy = gridImgOffset.top + gridImg.offsetHeight/2 - ((this.options.imgPosition.y > 0 ? 1-Math.abs(this.options.imgPosition.y) : Math.abs(this.options.imgPosition.y)) * win.height + this.options.imgPosition.y * win.height/2),
        z = gridImg.offsetWidth/this.originalImg.offsetWidth;

    this.originalImg.style.WebkitTransform = "translate3d(" + dx + "px, " + dy + "px, 0) scale3d(" + z + ", " + z + ", 1)";
    this.originalImg.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0) scale3d(" + z + ", " + z + ", 1)";

    // once that's done..
    onEndTransition(this.originalImg, function() {
      // clear description
      self.previewDescriptionEl.innerHTML = "";

      // show original grid item
      // classie.remove(gridItem, "grid__item--current");
      $(gridItem).removeClass("grid__item--current");

      // fade out the original image
      setTimeout(function() { self.originalImg.style.opacity = 0; }, 60);

      // and after that
      onEndTransition(self.originalImg, function() {
        // reset original/large image
        // classie.remove(self.originalImg, "animate");
        $(self.originalImg).removeClass("animate");
        self.originalImg.style.WebkitTransform = "translate3d(0,0,0) scale3d(1,1,1)";
        self.originalImg.style.transform = "translate3d(0,0,0) scale3d(1,1,1)";

        self.isAnimating = false;
      });
    });
  }

  /**
   * gets the window sizes
   */
  // GridFx.prototype._getWinSize = function() {
  _getWinSize() {
    return {
      width: document.documentElement.clientWidth,
      height: window.innerHeight
    };
  }

  // window.GridFx = GridFx;
}
