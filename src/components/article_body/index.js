import { Component } from "../../core/bane";
import $ from "jquery";
import ImageGallery from "../image_gallery";
import PoiCallout from "../poi_callout";
import moment from "moment";
import matchMedia from "../../core/utils/matchMedia";

require("./article_body.scss");

/**
 * Enhances the body of articles with a gallery and more
 */
export default class ArticleBodyComponent extends Component {
  initialize() {
    this.imageContainerSelector = ".stack__article__image-container";

    this.loadImages().then(() => {
      this.gallery = new ImageGallery({ el: ".article" });
    });

    matchMedia("(min-width: 1200px)", (query) => {
      if (query.matches) {
        this.loadPoiCallout();
      } else {
        if (typeof this.poiCallout !== "undefined") {
          this.poiCallout.destroy();
        }
      }
    });

    this.formatDate();
  }

  /**
   * Loads all the images in the body of the article
   * @return {Promise} A promise for when all of the images have loaded
   */
  loadImages() {
    let promises = [];

    this.$el.find(this.imageContainerSelector).each((index, el) => {
      let $img = $(el).find("img"),
          $a = $(el).find("a"),
          src = $($img).attr("src");

      let promise = this.loadImage(src).then((image) => {
        if (!$a.length) {
          $img.wrap(`<a class="copy--body__link" href="${src}" data-size="${image.width}x${image.height}" />`);
        } else {
          $a.attr({
            href: src,
            "data-size": `${image.width}x${image.height}`
          });
        }

        if(image.width > 1000 && $img.hasClass("is-landscape")) {
          $img.closest(this.imageContainerSelector)
            .addClass("is-wide");
        }

        $img.closest(this.imageContainerSelector)
          .addClass("is-visible");
      });

      promises.push(promise);
    });

    return Promise.all(promises);
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
        reject();
      };

      if (!url) {
        reject();
      }
    });
  }

  /**
   * Format the post date with moment.js and append it to the bottom of the article
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
   * Load POI data via AJAX
   * @return {Promise} A promise for when the AJAX request finishes
   */
  loadPoiData() {
    return new Promise((resolve, reject) => {
      $.ajax(`${window.location.pathname}.json`, {
        success: (response) => {
          resolve(response.article.content.pois);
        },
        error: (xhrObj, textStatus, error) => {
          reject(Error(error));
        }
      });
    });
  }

  /**
   * Creates a new instance of the POI callout; checks to see if the data
   * already exists and if not, caches it in a variable.
   * @return {[type]} [description]
   */
  loadPoiCallout() {
    if (typeof this.poiData === "undefined") {
      this.loadPoiData().then((response) => {
        this.poiCallout = new PoiCallout({
          el: this.$el,
          pois: response
        });

        this.poiData = response;
      });
    } else {
      this.poiCallout = new PoiCallout({
        el: this.$el,
        pois: this.poiData
      });
    }
  }
}
