import airbrakeJs from "airbrake-js";

let airbrake = new airbrakeJs({
  projectId: 108616, 
  projectKey: "046ae0791af77310d8cfe001786fad6f"
});

export default class Logger {
  /**
   * Log an error
   * @param {Error|Object|String} message Either string or object containing error details
   */
  error(err) {
    console.error(err);
    
    if (ENV_PROD) {
      airbrake.notify(err);
    }
  }
}
