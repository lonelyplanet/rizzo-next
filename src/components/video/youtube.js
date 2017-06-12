import VideoPlayer from "./video_player";

class Youtube extends VideoPlayer {

  setup() {
    if (!this.videoId) {
      return;
    }

    let html = "";
    html += "<iframe width='100%' height='100%' src='https://www.youtube.com/embed/";
    html += this.videoId;
    if (this.autoplay) {
      html += "?autoplay=1";
    }
    html += "' frameborder='0' allowfullscreen></iframe>";

    this.$el.html(html);
    this.trigger("ready");
  }

  dispose() {
    this.$el.html('');
  }
}
