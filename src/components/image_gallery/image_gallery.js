import { Component } from "../../core/bane";
import $ from "jquery";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";

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
    if (this._$pwsp) {
      return this._$pswp;
    }

    return this._$pswp = $(this.template({})).appendTo("body");
  }
  initialize({ 
    galleryImageSelector = ".stack__article__image-container" 
  } = {}) {
    this.template = require("./image_gallery_modal.hbs");

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
          // TODO: Do this on the Ruby side
          largeImage = $linkEl.attr("href").replace("travel-blog/tip-article/wordpress_uploads/", ""),
          smallImage = $linkEl.find("img").attr("src").replace("http://www.lonelyplanet.com/travel-blog/tip-article/wordpress_uploads/", "");

      let item = {
        src: `https://lonelyplanetwp.imgix.net/${largeImage}`,
        el: $galleryImage[0],
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10)
      };

      let $caption;
      if(($caption = $galleryImage.find("span")).length) {
        item.title = $caption.html();
      }

      if(smallImage) {
        item.msrc = `https://lonelyplanetwp.imgix.net/${smallImage}`;
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
  onGalleryClick(e) {
    e.preventDefault();

    let clickedListItem = e.currentTarget,
        index = this.$images.index(clickedListItem);

    if(index >= 0) {
      this.openPhotoSwipe( index );
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
      index
    };

    this._gallery = new PhotoSwipe( this.$pswp[0], PhotoSwipeUI_Default, items, options );
    this._gallery.init();
  };
}
