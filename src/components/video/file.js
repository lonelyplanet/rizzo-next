import VideoPlayer from "./video_player";

class File extends VideoPlayer {

  initialize(options) {
    this.player = null;
    super.initialize(options);
  }

  setup() {
    if (this.videoId) {
      let html = "<video preload='auto' src='" + this.videoId + "' ";

      if (this.cover) {
        html += "class='video__cover' ";
      }

      if (this.controls) {
        html += "controls ";
      }

      if (this.muted) {
        html += "muted ";
      }

      if (this.playsInline) {
        html += "playsinline webkit-playsinline ";
      }

      if (this.autoplay) {
        html += "autoplay ";
      }

      if (this.poster) {
        html += "poster='" + this.poster + "' ";
      }

      html += "></video>";

      this.$el.html(html);

      if (this.cover) {
        this.$el.addClass("video__cover--container");
      }

      this.player = this.el.getElementsByTagName("video")[0];
      this.player.onplaying = () => { this.trigger("started"); };
      this.player.onended = () => { this.trigger("ended"); };
    }
    super.setup();
  }

  play() {
    super.play();
    if (this.player) {
      const promise = this.player.play();
      if (promise) {
        promise.catch(reason => console.log("VIDEOJS:", reason)).then(() => {});
      }
    }
  }

  pause() {
    super.pause();
    if (this.player) {
      this.player.pause();
    }
  }

  dispose() {
    this.$el.html("");
    super.dispose();
  }
}

export default File;
