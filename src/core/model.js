import Events from "./mixins/events";

export default class Model {
  constructor({ url }) {
    this.url = url;
  }
  set(key, value) {
    if (typeof key === "object") {
      this.props = key;
    } else {
      let old = this.props[key];
      
      this.props[key] = value;
      
      this.trigger(`change:${key}`, value, {
        old,
        value
      });
    }

    this.trigger("change");
  }
  get(key) {
    if (typeof key === "undefined") {
      return this.props;
    } else {
      return this.props[key];
    }
  }
  parse(response) {
    return response;
  }
  fetch() {
    return new Promise((resolve, reject) => {
      $.ajax(this.url, {
        success: (response) => {
          this.set(this.parse(response));
          resolve(this);
        },
        error: (xhrObj, textStatus, error) => {
          reject(Error(error));
        }
      });
    });
  }
}

Object.assign(Model.prototype, Events);
