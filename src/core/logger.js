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
    console.log(JSON.stringify(err));
    
    if (ENV_PROD) {
      // airbrake.notify(err);

      if (window.trackJs) {
        let message = typeof err === "string" ? err : JSON.stringify(err); 
        window.trackJs.console.error(message);
      }
    }
  }
}
