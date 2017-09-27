import Brightcove from "./brightcove";
import Youtube from "./youtube";
import File from "./file";

require("./_video.scss");

let players = new Map();
players.set("brightcove", Brightcove);
players.set("youtube", Youtube);
players.set("file", File)

/*
  Video - an interface for inserting video embeds onto the page and/or
          creating a reference to a pre-existing video embed on the page.

  example usage:

    let player = null;
    Video.addPlayer("element-id", {autoplay: true}).then((x) => {
      player = x;
      player.on("ended", () => alert("video finished playing!")));
    });

  parameters:

    element - The HTML element to create a player in. This can be a string id for
          an existing DOM element or can be a reference to a DOM element.

    type - (optional) "brightcove", "youtube", or "file".  This determines which type of
          of embed code to generate and determines how rizzo interacts with the
          player

    playerName - (optional) "default", "bestintravel", "destinations", or "background".  This determines
          which player from the respective "type" to insert into the page. ("brightcove" only).

    videoId - (optional) The id or URL of the video to play.  This can be either an id
          pertaining to the platform depicted by the 'type' parameter, or it can
          be a URL to a video (which will be parsed internally to get the video id if needed)

    autoplay - (optional) Whether the player should autoplay once it's ready/loaded

    poster - (optional) URL to poster image to display before video begins
          playing ("file" only)

    seo - (optional) Whether to render SEO markup for the video ("brightcove" only)

    controls - (optional) Whether to include HTML5 video controls on the player or
          not ("brightcove" and "file" only)

    popout - (optional) Whether the player should follow the user when it scrolls
          out of view ("brightcove" only) -- Only works if the video embed does not
          exist on the page prior to instantiation.

  events:

    "ready" - Player has finished loading
    "disposed" - Player has been torn down and removed from the page
    "loadstart" - Video has finished loading and is ready to play ("brightcove" only)
    "ended" - Player has finished playing the current video ("brightcove" only)

*/
class Video {
  static addPlayer(element, {
    type = "brightcove",
    playerName = "default",
    videoId = null,
    autoplay = false,
    poster = null,
    controls = true,
    seo = true,
    popout = false,
  } = {}) {

    if (typeof element === "string") {
      element = document.getElementById(element);
    }

    if (!element) {
      return;
    }

    if (videoId && videoId.toLowerCase().startsWith("http")) {
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
      if (!youtubeId && !brightcoveId) {
        type = "file";
      }
    }

    this.players = this.players || new Map();

    let PlayerConstructor = players.get(type),
        player = new PlayerConstructor({
          el: element,
          playerId: this.players.size + 1,
          videoId,
          autoplay,
          poster,
          controls,
          playerName,
          seo,
          popout,
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
