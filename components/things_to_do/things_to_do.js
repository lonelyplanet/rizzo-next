import { Component } from "../../core/bane";

class ThingsToDo extends Component {

  initialize() {
    this.events = {
    };

    this.$el.find('.image-card__image').each((index, element) => {
      let $el = $(element);

      let imageUrl = $el.data('image-url');
      let backupUrl = $el.data('backupimage-url');

      this.lazyLoadImage(imageUrl)
        .then(undefined, () => {
          return this.lazyLoadImage(backupUrl);
        })
        .then((url) => {
          $el.css({
            'background-image': 'url('+ url +')'
          });
          $el.addClass('image-card__image--visible');
        })
    });
  }

  lazyLoadImage(url) {
    let image = new Image();

    return new Promise((resolve, reject) => {
      image.src = url;
      image.onload = function(){
        resolve(url);
      };
      image.onerror = function(e){
        reject();
      }
    });
  }
}

export default ThingsToDo;
