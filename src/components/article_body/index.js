import { Component } from "../../core/bane";
import $ from "jquery";
import ImageGallery from "../image_gallery";
import "./article_body.scss";

/**
 * Enhances the body of articles with a gallery and more
 */
export default class ArticleBodyComponent extends Component {
  initialize() {
    this.loadImages().then(() => {
      this.gallery = new ImageGallery({ el: ".article" });
    });
  }
  /**
   * Loads all the images in the body of the article
   * @return {Promise} A promise for when all of the images have loaded
   */
  loadImages() {
    let promises = [];

    this.$el.find(".stack__article__image-container").each((index, el) => {
      let $img = $(el).find("img"),
          $a = $(el).find("a"),
          src = $($img).attr("src");

      let promise = this.loadImage(src).then((image) => {
        $a.attr("data-size", `${image.width}x${image.height}`)
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
}
