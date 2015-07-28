import Brightcove from "./brightcove";

require("./video_player.scss");

let players = new Map();
players.set("brightcove", Brightcove);

class Video {
  static addPlayer(element, done, type="brightcove") {
    if (typeof done === "string") {
      let tmp = done;
      done = type;
      type = tmp;
    }
    this.players = this.players || new Map();

    let PlayerConstructor = players.get(type),
        player = new PlayerConstructor({
          playerId: this.players.size + 1
        });

    this.players.set(element, player);

    $(element).append(player.el);

    return new Promise((resolve, reject) => {
      player.on("ready", () => {
        resolve(player);
      });
    });
  }
}

export default Video;
