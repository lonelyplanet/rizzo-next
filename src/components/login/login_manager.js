import $ from "jquery";
import publish from "../../core/decorators/publish";
import User from "./user";

export default class LoginManager {
  constructor() {
    this.lunaStatusUrl = "https://auth.lonelyplanet.com/users/status.json";
    this.dotcomConnectStatusUrl = "https://connect.lonelyplanet.com/users/status.json";
    this.feedUrl = "https://www.lonelyplanet.com/thorntree/users/feed";

    if (window.lp.auth && window.lp.auth.host) {
      this.dotcomConnectStatusUrl = `${window.lp.auth.host}/users/status.json`;
    }

    this.checkStatus();
  }
  /**
   * Check to see if the user is currently logged in.
   * @return {jQuery.Deferred}
   */
  checkStatus() {
    $.when(
      $.ajax({
        url: this.lunaStatusUrl,
        dataType: "jsonp",
        error: this.error.bind(this)
      }),
      $.ajax({
        url: this.dotcomConnectStatusUrl,
        dataType: "jsonp",
        error: this.error.bind(this)
      })
    ).done(([lunaUser], [connectUser]) => {
      let user = Object.assign({}, connectUser, { "connect": true });

      if (lunaUser.id) {
        user = Object.assign({}, lunaUser, { "luna": true });
      }

      this.statusFetched(user);
    });
  }
  /**
   * Callback from checking the user's login status.
   * If the user is not logged in, it will publish a user with a null id.
   * Will check for user notifications if the user is logged in.
   * @param  {Object} user User login information
   */
  statusFetched(user) {
    // When swapping UI components through _v cookie being set with a specific value
    // We need to instantiante the user with any variants being sent from the status check
    this.user = (user.username ? new User(user) : new User({ variant: user.variant }));

    if (!user.id) {
      return this._updateStatus();
    }

    this._updateStatus();
  }

  @publish("user.status.update")
  _updateStatus() {
    return this.user.toJSON();
  }

  error() {
    throw "Error retrieving luna login information";
  }
}
