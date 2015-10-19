import { Component } from "../../core/bane";
import "./_notification.scss";

class Notification extends Component {
  initialize(options) {
    this.content = options.content;
    this.target = options.target;
    this.className = options.className;
    this.template = require("./notification.hbs");
    this.render();
  }
  render() {
    let notification = this.build({
      number: this.content,
      className: this.className
    });
    this.target.append(notification);
    return this;
  }
}

export default Notification;
