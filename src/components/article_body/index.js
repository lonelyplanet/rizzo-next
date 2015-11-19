import { Component } from "../../core/bane";
import $ from "jquery";
import ImageGallery from "../image_gallery";
import moment from "moment";
import "./article_body.scss";

/**
 * Enhances the body of articles with a gallery and more
 */
export default class ArticleBodyComponent extends Component {
  initialize() {
    this.imageContainerSelector = ".stack__article__image-container";

    this.loadImages().then(() => {
      this.gallery = new ImageGallery({ el: ".article" });
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
        $a.attr("data-size", `${image.width}x${image.height}`);

        if(image.width > 1000 && $img.hasClass("is-landscape")) {
          $a.closest(this.imageContainerSelector)
            .addClass("is-wide");
        }

        $a.closest(this.imageContainerSelector)
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
}
