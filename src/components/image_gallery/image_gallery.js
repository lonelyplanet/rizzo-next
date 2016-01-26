import { Component } from "../../core/bane";
import $ from "jquery";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import track from "../../core/decorators/track";
import YouTubePlayer from 'youtube-player';

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
          url = $linkEl.attr("href"),
          youtubeID = this._youtubeID(url);

      let item = {
        el: $linkEl.find("img")[0],
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10)
      }

      let $caption;
      if(($caption = $galleryImage.find("span")).length) {
        item.title = $caption.html();
      } else if(($caption = $galleryImage.next(".copy--caption")).length) {
        item.title = $caption.html();
      } else if(($caption = $galleryImage.next("p").find(".caption")).length) {
        item.title = $caption.html();
      }

      if(youtubeID){
        item.youtubeID = youtubeID;
        item.html = '<div class="pswp__youtube-player" id="' + youtubeID + '"></div>';
        item.title = null;
      }else{
        item.src = url;
        item.msrc = url;
      }

      items.push(item);
    });

    return items;
  }


  /**
   * Callback from photoswipe gallery close
   */
  onGalleryClose = () => {
    this._youtubeStop();
  }

  /**
   * Callback from photoswipe item change
   */
  onGalleryChange = () => {
    this._youtubePlay(this._gallery.currItem.youtubeID);
  }

  /**
   * Plays youtube movie if given proper movie ID
   */
  _youtubePlay(youtubeID){
    if(youtubeID){
      this._player = YouTubePlayer(youtubeID);
      this._player.loadVideoById(youtubeID); 
      this._player.playVideo();
    }else {
      this._youtubeStop();
    }
  }

  /**
   * Stops youtube movie and destroys the player
   */
  _youtubeStop(){
    if(this._player) this._player.destroy().then(() => {
      this._player = null;
    });
  }

  /**
   * Gets youtube movie id from given youtube movie url
   */
  _youtubeID(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return null;
    }
  }



  /**
   * Callback from clicking on a gallery image
   * @param  {Event}  event Event
   * @return {Object}       Returns an object to send data to GA for tracking
   */
  @track("gallery click");
  onGalleryClick(event) {
    event.preventDefault();

    let clickedListItem = event.currentTarget,
        index = this.$images.index(clickedListItem),
        src = $(clickedListItem).find("img").attr("src");

    if(index >= 0) {
      this.openPhotoSwipe(index);
    }

    return src;
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
    this._gallery.listen('afterChange', this.onGalleryChange);
    this._gallery.listen('close', this.onGalleryClose);
    this._gallery.init();
  }
}
