import { Component } from "../../core/bane";
import MobilUtil from "../../core/mobile_util";

class VideoPlayer extends Component {

  initialize({ playerId }) {
    this.playerId = playerId;

    this.defaultAspectRatio = 1.77777778;
    this.events = {};

    this.ready = false;
    this.on("ready", () => { this.ready = true; });
    
    this.setup();
  }

  /**
   * Run any setup to load the player (ex. videojs player).
   * Make sure this.trigger("ready") is called within this function.
   */
  setup() {
    this.trigger("ready");
  }

  /**
   * Override to actually play the underlying player
   */
  play() {
  }

  /**
   * Override to actually pause the underlying player
   */
  pause() {
  }

  /**
   * Determines whether 360 Video is supported on the current device.
   * 
   * references: 
   *   https://gist.github.com/dhinus/909b1530d2b30681edf7
   *   http://www.useragentstring.com/pages/useragentstring.php
   *
   */
  is360VideoSupported() {
    // Must not be a mobile device
    if (MobilUtil.isMobileOrTablet()) {
      return false;
    }

    // WebGL must be available
    let canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl")) {
      return false;
    }

    let ua = navigator.userAgent || navigator.vendor || window.opera;

    // Chrome >= 40
    if (/Chrome\/[^123][0-9]/.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua)) {
      return true;
    }

    // Firefox >= 40
    if (/Firefox\/[^123][0-9]/.test(ua)) {
      return true;
    }

    // Microsoft Edge
    if (/Edge\//.test(ua)) {
      return true;
    }

    // Opera >= 30 (Opera 12 and lower used "Opera" in the user agent string, but new versions use "OPR")
    if (/OPR\/[^12][0-9]/.test(ua)) {
      return true;
    }

    return false;
  }

}

export default VideoPlayer;
