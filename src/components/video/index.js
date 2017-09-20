import Brightcove from "./brightcove";
import Youtube from "./youtube";

require("./_video.scss");

let players = new Map();
players.set("brightcove", Brightcove);
players.set("youtube", Youtube);

class Video {
  static addPlayer(element, {
    type = "brightcove",
    videoId = null,
    autoplay = false,
  } = {}) {

    // element - can be passed in as a dom reference
    // or the string ID of an element.  Convert to a reference if necessary.
    if (typeof element === "string") {
      element = document.getElementById(element);
    }

    if (!element) {
      return;
    }

    // videoId - can be passed in as the id string of a video
    // as it pertains to the specified 'type' OR can be passed in as an
    // URL which will be parsed to automatically determine the actual
    // 'videoId' and 'type' values.
    if (videoId && videoId.startsWith("http")) {
      const youtubeId = this.getYoutubeId(videoId);
      const brightcoveId = this.getBrightcoveId(videoId);

      if (youtubeId) {
        videoId = youtubeId;
        type = "youtube";
      }
      if (brightcoveId) {
        videoId = brightcoveId;
        type = "brightcove";
      }
    }

    this.players = this.players || new Map();

    let PlayerConstructor = players.get(type),
        player = new PlayerConstructor({
          el: element,
          playerId: this.players.size + 1,
          videoId,
          autoplay,
        });

    this.players.set(element, player);

    player.on("disposed", this.removePlayer.bind(this));

    // Take the return value and use .then() on it to ensure the
    // player is ready before using it.
    return new Promise((resolve) => {
      if (player.isReady) {
        resolve(player);
        return;
      }
      player.on("ready", () => {
        resolve(player);
      });
    });
  }

  static removePlayer(player) {
    if (this.players) {
      this.players.delete(player.el);
    }
  }

  static getYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length == 11 ? match[2] : null;
  }

  static getBrightcoveId(url) {
    const regExp = /^.*\.brightcove\..*(\/videos\/|\?videoId=)([0-9]+).*/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  }
}

export default Video;
