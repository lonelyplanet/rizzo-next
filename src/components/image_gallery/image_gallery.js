import { Component } from "../../core/bane";
import $ from "jquery";
import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";
import Video from "../video";

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
    galleryImageSelector = ".stack__article__image-container",
    autoplayVideos = true
  } = {}) {
    this.template = require("./image_gallery.hbs");
    this.autoplayVideos = autoplayVideos;

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
          image = $linkEl.find("img").attr("src"),
          link = $linkEl.attr("href"),
          largeImage = link.match(/\.(jpg|png|gif)/) ? link : image,
          youtubeID = this._youtubeID(link),
          brightcoveID = this._brightcoveID(link);

      let item = {
        src: largeImage,
        msrc: image,
        el: $linkEl.find("img")[0],
        w: parseInt(size[0], 10),
        h: parseInt(size[1], 10),
        videoID: youtubeID || brightcoveID,
        videoType: youtubeID ? "youtube" : brightcoveID ? "brightcove" : null,
      };

      let $caption;
      if (($caption = $galleryImage.find("span")).length) {
        item.title = $caption.html();
      } else if (($caption = $galleryImage.next(".copy--caption")).length) {
        item.title = $caption.html();
      } else if (($caption = $galleryImage.next("p").find(".caption")).length) {
        item.title = $caption.html();
      }

      if (item.videoID) {
        item.html = "<div class='pswp__player' id='" + item.videoID + "'></div>";
        item.title = null;
        item.src = null;
        item.msrc = null;
      }

      items.push(item);
    });

    return items;
  }


  /**
   * Callback from photoswipe gallery close
   */
  onGalleryClose() {
    this._videoStop();
    // this._youtubeStop();
  }

  /**
   * Callback from photoswipe item change
   */
  onGalleryChange() {
    this._videoPlay(this._gallery.currItem);
    // this._youtubePlay(this._gallery.currItem);
    // this._brightcovePlay(this._gallery.currItem);
  }

  /**
   * Plays youtube movie if given proper movie ID
   */
  // _youtubePlay(galleryItem) {
  //   if (galleryItem.youtubeID) {
  //     this._player = document.getElementById(galleryItem.youtubeID);
  //     this._player.innerHTML = "<iframe width='100%' height='100%' src='https://www.youtube.com/embed/" + galleryItem.youtubeID + "?autoplay=1' frameborder='0' allowfullscreen></iframe>";
  //   } else {
  //     this._youtubeStop();
  //   }
  // }
  //
  // /**
  //  * Plays brightcove movie if given proper movie ID
  //  */
  // _brightcovePlay(galleryItem) {
  //   if (galleryItem.brightcoveID) {
  //     this._player = document.getElementById(galleryItem.brightcoveID);
  //     Video.addPlayer(this._player, "brightcove").then(this.playerReady.bind(this));
  //   } else {
  //     this._brightcoveStop();
  //   }
  // }

  _videoPlay(galleryItem) {
    if (galleryItem.videoID) {
      Video.addPlayer(
        galleryItem.videoID,
        { type: galleryItem.videoType,
          videoId: galleryItem.videoID,
          autoplay: this.autoplayVideos }).then(this.playerReady.bind(this));
    }
    else {
      this._videoStop();
    }
  }

  playerReady (player) {
    this._player = player;
    // this.bcPlayer = player;
    // this.listenTo(this.player, "ended", this.onPlayerEnded.bind(this));
    // this.player.fetchVideos().then(this.fetchDone.bind(this));
  }

  /**
   * Stops youtube movie and destroys the player
   */
  // _youtubeStop() {
  //   if (this._player) {
  //     this._player.innerHTML = "";
  //     this._player = null;
  //   }
  // }
  //
  // _brightcoveStop() {
  //   if (this.bcPlayer) {
  //     // this.bcPlayer.dispose();
  //   }
  //   if (this._player) {
  //     this._player.innerHTML = "";
  //     this._player = null;
  //   }
  // }

  _videoStop() {
    if (this._player) {
      this._player.dispose();
      this._player = null;
    }
  }

  /**
   * Gets youtube movie id from given youtube movie url
   */
  _youtubeID(url) {
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
      match = url.match(regExp);

    return match && match[2].length == 11 ? match[2] : null;
  }

  /**
   * Gets brightcove movie id from given brightcove movie url
   */
  _brightcoveID(url) {
    let regExp = /^.*\.brightcove\..*(\/videos\/|\?videoId=)([0-9]+)$/,
      match = url.match(regExp);

    return match ? match[2] : null;
  }

  /**
   * Callback from clicking on a gallery image
   * @param  {Event}  event Event
   * @return {Object}       Returns an object to send data to GA for tracking
   */
  onGalleryClick(event) {
    event.preventDefault();

    let clickedListItem = event.currentTarget,
        index = this.$images.index(clickedListItem),
        src = $(clickedListItem).find("img").attr("src");

    if (index >= 0) {
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
    this._gallery.listen("afterChange", this.onGalleryChange.bind(this));
    this._gallery.listen("close", this.onGalleryClose.bind(this));
    this._gallery.init();
  }
}
