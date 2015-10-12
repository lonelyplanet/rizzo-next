import $ from "jquery";
import publish from "../../core/decorators/publish";
import User from "./user";

export default class LoginManager {
  constructor() {
    this.statusUrl = "https://auth.lonelyplanet.com/users/status.json";
    this.feedUrl = "https://www.lonelyplanet.com/thorntree/users/feed";
    
    this.checkStatus();
  }
  /**
   * Check to see if the user is currently logged in.
   * @return {jQuery.Deferred}
   */
  checkStatus() {
    return $.ajax({
      url: this.statusUrl,
      dataType: "jsonp",
      success: this.statusFetched.bind(this),
      error: this.error.bind(this)
    });
  }
  /**
   * Callback from checking the user's login status.
   * If the user is not logged in, it will publish a user with a null id.
   * Will check for user notifications if the user is logged in.
   * @param  {Object} user User login information
   */
  statusFetched(user) {
    this.user = (user.username ? new User(user) : new User());
    
    if (!user.id) {
      return this.updateStatus();
    }

    this.getNotifications().done((data) => {
      this.notificationsFetched(data);
      this.updateStatus();
      this.pollForUpdates();
    });
  }
  /**
   * Update the user's notifications with data from Luna
   * @param  {Object} data The new data
   */
  notificationsFetched(data) {
    this.user.activities = data.activities;
    this.user.messages = data.messages;
  }
  /**
   * Set up an interval to check for Luna notification updates.
   */
  pollForUpdates() {
    this.pollInterval = setInterval(() => {
      this.getNotifications()
        .done(this.checkNotifications.bind(this));
    }, 15000);
  }
  /**
   * Retrieve Thorntree notifications
   * @return {jQuery.Deferred} A jQuery promise
   */
  getNotifications() {
    return $.ajax({
      url: this.feedUrl,
      dataType: "jsonp"
    });
  }
  /**
   * Check to see if there are new notications from thorntree.
   * If there are, it will update the user's messages and activity.
   * @param  {Object} data Notification data from thorntree
   */
  checkNotifications(data) {
    // Only update if things have changed
    if(
      JSON.stringify(data.messages) !== JSON.stringify(this.user.messages) || 
      JSON.stringify(data.activities) !== JSON.stringify(this.user.activities)
    ) {
      this.notificationsFetched(data);
      this.updateNotifications();  
    }
  }
  @publish("user.status.update")
  updateStatus() {
    return this.user.toJSON();
  }
  @publish("user.notifications.update")
  updateNotifications() {
    return this.user.toJSON();
  }
  error() {
    throw "Error retrieving luna login information";
  }
}
