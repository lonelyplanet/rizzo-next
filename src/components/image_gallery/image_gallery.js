import { Component } from "../../core/bane";
import $ from "jquery";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import track from "../../core/decorators/track";

// Keep track of instance IDs
let instanceId = 0;

/**
 * A component for creating an Image Gallery
 */
export default class ImageGalleryComponent extends Component {
  /**
   * Render the gallery viewer
   * @return {jQuery} Returns the gallery element
   */
  get $pswp() {
    if (this._$pswp) {
      return this._$pswp;
    }

    return this._$pswp = $(this.template({})).appendTo("body");
  }

  initialize({
    galleryImageSelector = ".stack__article__image-container"
  } = {}) {
    this.template = require("./image_gallery.hbs");

    this.$images = this.$el.find(galleryImageSelector);

    this.events = {
      ["click " + galleryImageSelector]: "onGalleryClick"
    };

    this.$el.attr({
      "data-pswp-uid": ++instanceId,
      "data-gallery": this
    });
  }

  _parseThumbnailElements() {
    if (this._items) {
      return this._items;
    }

    let items = this._items = [];

    this.$images.each((i, el) => {
      let $galleryImage = $(el),
          $linkEl = $galleryImage.find("a"),
          size = $linkEl.attr("data-size").split("x"),
          image = $linkEl.find("img").attr("src");

      let item = {
        src: $linkEl.attr("href"),
        msrc: image,  
        el: $linkEl.find("img")[0],
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10)
      };

      let $caption;
      if(($caption = $galleryImage.find("span")).length) {
        item.title = $caption.html();
      } else if(($caption = $galleryImage.next(".copy--caption")).length) {
        item.title = $caption.html();
      } else if(($caption = $galleryImage.next("p").find(".caption")).length) {
        item.title = $caption.html();
      }

      items.push(item);
    });

    return items;
  }

  /**
   * Callback from clicking on a gallery image
   * @param  {Event} e Event
   * @return {Boolean} Returns false to prevent bubbling and cancel event
   */
  @track("Article Photo Gallery Click");
  onGalleryClick(e) {
    e.preventDefault();

    let clickedListItem = e.currentTarget,
        index = this.$images.index(clickedListItem);

    if(index >= 0) {
      this.openPhotoSwipe(index);
    }

    return false;
  }

  /**
   * Open the photo gallery
   * @param  {[type]} index [description]
   * @return {[type]}       [description]
   */
  openPhotoSwipe(index = 0) {
    let items = this._parseThumbnailElements();

    let options = {
      galleryUID: this.$el.attr("data-pswp-uid"),
      getThumbBoundsFn: function(index) {
        let thumbnail = items[index].el, // find thumbnail
            pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
            rect = thumbnail.getBoundingClientRect();

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
      },
      history: false,
      counterEl: false,
      index
    };

    this._gallery = new PhotoSwipe( this.$pswp[0], PhotoSwipeUI_Default, items, options );
    this._gallery.init();
  }
}
