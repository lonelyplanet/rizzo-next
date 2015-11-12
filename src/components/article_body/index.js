import { Component } from "../../core/bane";
import $ from "jquery";
// import ImageGallery from "../image_gallery";
import "./article_body.scss";

class ArticleBodyComponent extends Component {
  initialize(options) {
    console.log("Article Body loaded");

    // let self = this;

    // self.$el.find(".stack__article__image-container").each(function(index, el) {
    //   let img = $(el).find("img"),
    //       href = $(el).find("a").attr("href"),
    //       src = $(img).attr("src");

    //   console.log(img, href, src);
    // });

    // let options = {};
    // new ImageGallery(document.querySelector('.article'), options);
  }
}

export default ArticleBodyComponent;
