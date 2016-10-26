/* global videojs */

import VideoPlayer from "./video_player";

class BrightcoveDefault extends VideoPlayer {

  // get scripts() {
  //   return [
  //     "https://players.brightcove.net/5104226627001/default_default/index.min.js"
  //   ];
  // }


  initialize(options) {
    super.initialize(options);
  }

  /**
   * Search for a video by it's Atlas ID
   * @returns {Promise}
   */
  search() {

    return Promise.resolve([5136109874001]);

    // return new Promise((resolve) => {
    //   BCMAPI.search({
    //     all: `atlas_id:${window.lp.place.atlasId}`
    //   });

    //   this.searchResolver = resolve;
    // });
  }
  /**
   * Pause the playing video
   */
  pause() {
    super.pause();
  }
  /**
   * Play the video
   */
  play() {
    super.play();
  }

  /**
   * Render the brightcove template
   */
  render() {
    super.render();
    // this.$el.html(template({
    //   playerId: this.playerId
    // }));
  }

  // loadPlayer() {

  // }

  setup() {
    // super.setup();
    // let base = super;
    let self = this;

    videojs(this.el).ready(() => {
      self.player = this;
      // self.setup();
      // self.trigger('ready');
      // base.setup();
      self.trigger("ready");
    });
  }

  /**
   * Callback from the BEGIN event from the video player
   */
  // begin() {
  //   this.trigger("begin");
  //   this.isPlaying = true;
  // }
  // progress() {
  //   this.trigger("progress");
  // }
  // playing() {
  //   this.trigger("play");
  // }
  // calculateDimensions() {
  //   let resizeWidth = document.getElementById("masthead-video-player").clientWidth,
  //       resizeHeight = document.getElementById("masthead-video-player").clientHeight;

  //   if (this.experienceModule && this.experienceModule.experience.type === "html") {
  //       this.experienceModule.setSize(resizeWidth, resizeHeight);
  //   }
  // }
  // onTemplateReady() {
  //   this.videoPlayer.addEventListener(brightcove.api.events.MediaEvent.CHANGE, () => {
  //     this.searchResolver(this.mastheadVideoIds);
  //   });

  //   this.videoPlayer.cueVideoByID(this.mastheadVideoIds[0]);
  // }
  // onSearchResponse(jsonData) {
  //   let mastheadVideoIds = [];

  //   for (let index in jsonData.items) {
  //     mastheadVideoIds.push(jsonData.items[index].id);
  //   }

  //   // Only load the brightcove player when there's videos for a place
  //   if (mastheadVideoIds.length) {
  //     this.mastheadVideoIds = mastheadVideoIds;
  //     $.getScript("https://sadmin.brightcove.com/js/BrightcoveExperiences.js");
  //   }
  // }
}

export default BrightcoveDefault;
