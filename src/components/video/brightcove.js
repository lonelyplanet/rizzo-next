/* global brightcove, BCMAPI */

import VideoPlayer from "./video_player";

let template = require("./brightcove.hbs");

class Brightcove extends VideoPlayer {
  get scripts() {
    // TODO: Move this to config with webpack
    return [
      "http://files.brightcove.com/bc-mapi.js",
      "http://admin.brightcove.com/js/BrightcoveExperiences.js"
    ];
  }
  initialize(options) {
    super.initialize(options);

    window.BCL = window.BCL || {};
  }
  search() {
    return new Promise((resolve) => {
      BCMAPI.search({
        all: `atlas_id:${window.lp.place.atlasId}`
      });

      this.searchResolver = resolve;
    });
  }
  pause() {
    this.videoPlayer.pause();

    super.pause();
  }
  play() {
    this.calculateDimensions();
    this.videoPlayer.play();
    super.play();
  }

  render() {
    this.$el.html(template({
      playerId: this.playerId
    }));
  }
  onTemplateLoad(id) {
    function calculateNewPercentage(width, height) {
      var newPercentage = ((height / width) * 100) + "%";
      document.getElementById("outer-container").style.paddingBottom = newPercentage;
    }

    this.player = brightcove.api.getExperience(id || "masthead-video-player");

    // get a reference to the video player
    this.videoPlayer = this.player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
    this.experienceModule = this.player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);

    this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PLAY, () => this.trigger("play"));
    this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.STOP, () => this.trigger("stop"));

    this.videoPlayer.getCurrentRendition((renditionDTO) => {
      if (renditionDTO) {
        calculateNewPercentage(renditionDTO.frameWidth, renditionDTO.frameHeight);
      } else {
        this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PLAY, (event) =>
        {
          calculateNewPercentage(event.media.renditions[0].frameWidth, event.media.renditions[0].frameHeight);
        });
      }
    });
  }
  setup() {
    /* global brightcove, BCMAPI */
    brightcove.createExperiences();

    window.BCL["player" + this.playerId] = this;
    this.onTemplateLoad = this.onTemplateLoad.bind(this);
    this.onTemplateReady = this.onTemplateReady.bind(this);
    this.onSearchResponse = this.onSearchResponse.bind(this);

    // Media API read token
    // TODO: Determine the best practice for securing the token.
    BCMAPI.token = "f1kYE3jBtEUS9XJ9rxo4ijS9rAhTizk87O6v7jMZ49qWmQemLSPhbw..";
    // set the callback for Media API calls
    BCMAPI.callback = `BCL.player${this.playerId}.onSearchResponse`;

    window.onresize = this.calculateDimensions.bind(this);
  }
  calculateDimensions() {
    var resizeWidth = document.getElementById("masthead-video-player").clientWidth,
        resizeHeight = document.getElementById("masthead-video-player").clientHeight;

      if (this.experienceModule.experience.type === "html"){
        this.experienceModule.setSize(resizeWidth, resizeHeight);
    }
  }
  onTemplateReady() {
    this.trigger("ready");
  }
  onSearchResponse(jsonData) {
    let mastheadVideoIds = [];

    for (let index in jsonData.items) {
      mastheadVideoIds.push(jsonData.items[index].id);
    }

    this.videoPlayer.cueVideoByID(mastheadVideoIds[0]);

    this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.CHANGE, () => {
      this.searchResolver(mastheadVideoIds);
    });
  }
}

export default Brightcove;
