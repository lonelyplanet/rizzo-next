import { Component } from "../../core/bane";
import $ from "jquery";
import ImageGallery from "../image_gallery";
import moment from "moment";

/**
 * Enhances the body of articles with a gallery and more
 */
export default class ArticleBodyComponent extends Component {
  initialize() {
    this.imageContainerSelector = ".stack__article__image-container";

    this.loadImages().then(() => {
      this.gallery = new ImageGallery({
        el: this.$el,
        trackCategoryModifier: "article"
      });
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
          }).wrap(`<span class="copy--caption" />`);
        }
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
}
