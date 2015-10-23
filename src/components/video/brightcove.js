/* global brightcove, BCMAPI */

import VideoPlayer from "./video_player";

let template = require("./brightcove.hbs");

class Brightcove extends VideoPlayer {
  get scripts() {
    return [
      "https://files.brightcove.com/bc-mapi.js",
      "https://sadmin.brightcove.com/js/BrightcoveExperiences.js"
    ];
  }
  initialize(options) {
    super.initialize(options);

    window.BCL = window.BCL || {};
  }

  /**
   * Search for a video by it's Atlas ID
   * @returns {Promise}
   */
  search() {
    return new Promise((resolve) => {
      BCMAPI.search({
        all: `atlas_id:${window.lp.place.atlasId}`
      });

      this.searchResolver = resolve;
    });
  }
  /**
   * Pause the playing video
   */
  pause() {
    // This kind of sucks, but since it's flash based I have to keep trying to pause
    // until it actually pauses... O_o
    if (this.isPlaying) {
      clearTimeout(this.pauseTimer);
      this.videoPlayer.pause(true);

      super.pause();
    } else {
      this.pauseTimer = setTimeout(() => this.pause(), 50);
    }
  }
  /**
   * Play the video
   */
  play() {
    this.calculateDimensions();
    this.videoPlayer.play();

    super.play();
  }

  /**
   * Render the brightcove template
   */
  render() {
    this.$el.html(template({
      playerId: this.playerId
    }));
  }

  /**
   * Callback from the brightcove API
   * @param id
   */
  onTemplateLoad(id) {
    function calculateNewPercentage(width, height) {
      let newPercentage = ((height / width) * 100) + "%";
      document.getElementById("outer-container").style.paddingBottom = newPercentage;
    }

    this.player = brightcove.api.getExperience(id || "masthead-video-player");

    // get a reference to the video player
    this.videoPlayer = this.player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
    this.experienceModule = this.player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);

    this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PROGRESS, this.progress.bind(this));
    this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.BEGIN, this.begin.bind(this));
    this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.PLAY, this.playing.bind(this));
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
    brightcove.createExperiences();

    window.BCL["player" + this.playerId] = this;
    this.onTemplateLoad = this.onTemplateLoad.bind(this);
    this.onTemplateReady = this.onTemplateReady.bind(this);
    this.onSearchResponse = this.onSearchResponse.bind(this);

    // Media API read token
    BCMAPI.token = "f1kYE3jBtEUS9XJ9rxo4ijS9rAhTizk87O6v7jMZ49qWmQemLSPhbw..";
    // set the callback for Media API calls
    BCMAPI.callback = `BCL.player${this.playerId}.onSearchResponse`;

    window.onresize = this.calculateDimensions.bind(this);
  }

  /**
   * Callback from the BEGIN event from the video player
   */
  begin() {
    this.trigger("begin");
    this.isPlaying = true;
  }
  progress() {
    this.trigger("progress");
  }
  playing() {
    this.trigger("play");
  }
  calculateDimensions() {
    let resizeWidth = document.getElementById("masthead-video-player").clientWidth,
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

    if (mastheadVideoIds.length) {
      this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.CHANGE, () => {
        this.searchResolver(mastheadVideoIds);
      });

      this.videoPlayer.cueVideoByID(mastheadVideoIds[0]);
    }
  }
}

export default Brightcove;
