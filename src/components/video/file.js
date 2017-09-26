import VideoPlayer from "./video_player";

class File extends VideoPlayer {

  initialize(options) {
    this.player = null;
    super.initialize(options);
  }

  setup() {
    if (this.videoId) {
      let html = "<video preload='auto' src='" + this.videoId + "' ";

      if (this.controls) {
        html += " controls ";
      }

      if (this.autoplay) {
        html += " autoplay ";
      }

      if (this.poster) {
        html += "poster='" + this.poster + "' ";
      }

      html += "></video>";

      this.$el.html(html);

      this.player = this.el.getElementsByTagName("video")[0];
    }
    super.setup();
  }

  play() {
    super.play();
    if (this.player) {
      this.player.play();
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
