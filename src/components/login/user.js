let rClass = /\sclass=\"[a-zA-Z_-\s]*\"/g;

export default class User {
  constructor({
    id,
    email,
    username,
    facebookUid,
    profileSlug,
    luna,
    connect,
    avatar = "http://dummyimage.com/80x80/4d494d/686a82.gif",
    messages = [],
    activity = [],
  } = {}) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.facebookUid = facebookUid;
    this.profileSlug = profileSlug;
    this.avatar = avatar.replace(/small/, "large");
    this.messages = messages;
    this.activity = activity;
    this.luna = luna;
    this.connect = connect;
    this.profileLink = connect ?
      `/profile/${id}/edit` :
      `//www.lonelyplanet.com/thorntree/profiles/${profileSlug}`;

    this.publicProfileLink = connect ?
      `/profile/${username}` :
      `//www.lonelyplanet.com/thorntree/profiles/${profileSlug}`;

    this.signOutLink = connect ?
      "//connect.lonelyplanet.com/users/sign_out" :
      "//auth.lonelyplanet.com/users/sign_out";

    if (window.lp.auth && window.lp.auth.host) {
      this.signOutLink = `${window.lp.auth.host}/users/sign_out`;
    }
  }
  toJSON() {
    let obj = {};
    for(let key in this) {
      if (this.hasOwnProperty(key)) {
        obj[key] = this[key];
      }
    }

    obj.messages = obj.messages.length ? obj.messages.map((msg) => {
        return {
          text: msg.text.replace(rClass, ""),
          read: msg["read?"]
        };
      }) : null;

    obj.activity = obj.activity.length ? obj.activity : null;

    obj.activity_count = obj.activity ? obj.activity.length : null;
    obj.unread_message_count = obj.messages ? obj.messages.filter((msg) => !msg.read).length : null;

    obj.notification_count = (obj.activity_count || 0) + (obj.unread_message_count || 0);

    return obj;
  }
}
