import { Component } from "../../core/bane";
import $ from "jquery";
import ImageGallery from "../image_gallery";
import PoiCallout from "../poi_callout";
import Video from "../video";
import moment from "moment";
import matchMedia from "../../core/utils/matchMedia";
import breakpoints from "../../core/utils/breakpoints";
import rizzo from "../../rizzo";

const adpackage = document.cookie.match(/adpackage/);

/**
 * Enhances the body of articles with a gallery and more
 */
export default class ArticleBodyComponent extends Component {
  initialize(options) {
    this.imageContainerSelector = ".stack__article__image-container";
    this.poiData = options.poiData;

    this.loadImages().then(() => {
      this.gallery = new ImageGallery({
        el: this.$el
      });
    });

    if (this.poiData) {
      matchMedia(`(min-width: ${breakpoints.min["1200"]})`, (query) => {
        if (query.matches) {
          this.loadPoiCallout(this.poiData);
        } else {
          if (typeof this.poiCallout !== "undefined") {
            this.poiCallout.destroy();
          }
        }
      });
    }

    let featuredImage = this.el.find(this.imageContainerSelector);
    let $paragraphs = this.$el.find("p");
    let showAd = $paragraphs.length >= 2 || featuredImage.length;

    if (showAd) {
      matchMedia(`(max-width: ${breakpoints.max["480"]})`, (query) => {
        if (query.matches) {
          this._appendAd($paragraphs, featuredImage);
        }
      });
    }

    this.formatDate();
    this.loadVideos();

  }

  loadVideos() {
    this.$el.find("[data-op-video-id]")
      .addClass("is-visible")
      .each((i, el) => {
        Video.addPlayer(el);
      });
  }

  /**
   * Loads all the images in the body of the article
   * @return {Promise} A promise for when all of the images have loaded
   */
  loadImages() {
    let promises = [];

    this.$el.find(this.imageContainerSelector).each((index, el) => {
      let $img = $(el).find("img"),
          $a = $(el).find("a").eq(0),
          $span = $(el).find("span"),
          src = $($img).attr("src");

      let promise = this.loadImage(src).then((image) => {
        if (!$a.length) {
          $img.wrap(`<a class="copy--body__link" href="${src}" data-size="${image.width}x${image.height}" />`);
        } else {
          $a.attr("data-size", `${image.width}x${image.height}`);
        }

        if(image.width > 1000 && $img.hasClass("is-landscape")) {
          $(el).addClass("is-wide");
        }

        $(el).addClass("is-visible");

        if (!$span.length) {
          $(el).contents().filter(function() {
            return this.nodeType === 3 && $.trim(this.nodeValue).length;
          }).wrap("<span class=\"copy--caption\" />");
        }
      });

      promises.push(promise);
    });

    return Promise.all(promises).catch((err) => {
      rizzo.logger.log(err);
    });
  }

  /**
   * Preload an image
   * @param  {String} url Url of the image to load
   * @return {Promise} A promise for when the image loads
   */
  loadImage(url) {
    let image = new Image();

    return new Promise((resolve, reject) => {
      image.src = url;
      image.onload = function() {
        resolve(image);
      };
      image.onerror = function() {
        reject(url);
      };

      if (!url) {
        reject(url);
      }
    });
  }

  /**
   * Format the post date with moment.js
   */
  formatDate() {
    let $footer = this.$el.siblings(".js-article-footer"),
        date = $footer.find("time").attr("datetime"),
        formattedDate = moment(date).format("MMMM YYYY");

    $footer
      .find("time").html(formattedDate)
      .closest(".js-article-post-date").removeProp("hidden");
  }

  /**
   * Creates a new instance of the POI callout
   * @param {Object} data POI data
   */
  loadPoiCallout(data) {
    this.poiCallout = new PoiCallout({
      el: this.$el,
      pois: data
    });
  }

  _appendAd($paragraphs, $featuredImage) {
    const element = adpackage ? `<div
      id="ad-articles-yieldmo"
      class="adunit--article"></div>` :
      `<div
        class="adunit adunit--article display-none"
        data-dfp-options='{ "namespace": "LonelyPlanet.com/Yieldmo" }'
        data-size-mapping="mpu-double"
        data-targeting='{ "position": "article-paragraph" }'></div>`;

    if($featuredImage.length) {
      $featuredImage.eq(0).after(element);
    } else {
      $paragraphs.eq(1).after(element);
    }

    window.lp.ads.manager.load();
  }
}
