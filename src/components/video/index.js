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

    if (typeof element === "string") {
      element = document.getElementById(element);
    }

    if (!element) {
      return;
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

    // Take the return value and use .then() on it to ensure the
    // player is ready before using it.
    return new Promise((resolve) => {
      if (player.isReady()) {
        resolve(player);
        return;
      }
      player.on("ready", () => {
        resolve(player);
      });
    });
  }
}

export default Video;
