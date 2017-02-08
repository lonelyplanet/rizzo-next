// import airbrakeJs from "airbrake-js";

// let airbrake = new airbrakeJs({
//   projectId: 108616,
//   projectKey: "046ae0791af77310d8cfe001786fad6f"
// });

export default class Logger {
  /**
   * Log an error
   * @param {Error|Object|String} err Either string or object containing error details
   */
  error(err) {
    if (ENV_PROD) {
      if (window.trackJs) {
        this._send("log", err);
      }
    } else {
      console.log(JSON.stringify(err));
    }
  }
  log(message) {
    this._send("log", message);
  }
  debug(message) {
    this._send("debug", message);
  }
  _send(type, message) {
    if (window.trackJs) {
      window.trackJs.console[type](message);
    }
  }
}
