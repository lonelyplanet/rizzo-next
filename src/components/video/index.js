import Brightcove from "./brightcove";

let players = new Map();
players.set("brightcove", Brightcove);

class Video {
  static addPlayer(element, type="brightcove") {
    if (typeof element === "string") {
      element = $(element)[0];
    }

    this.players = this.players || new Map();

    let PlayerConstructor = players.get(type),
        player = new PlayerConstructor({
          el: element,
          playerId: this.players.size + 1
        });

    this.players.set(element, player);

    // Take the return value and use .then() on it to ensure the 
    // player is ready before using it.
    return new Promise((resolve) => {
      player.on("ready", () => {
        resolve(player);
      });
    });
  }
}

export default Video;
