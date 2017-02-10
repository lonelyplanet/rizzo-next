import { Component } from "../../core/bane";

class Notification extends Component {
  initialize(options) {
    this.content = options.content;
    this.target = options.target;
    this.className = options.className;
    this.label = options.label;
    this.href = options.href;
    this.template = require("./notification.hbs");
    this.render();
  }
  render() {
    let notification = this.build({
      number: this.content,
      className: this.className,
      label: this.label,
      href: this.href,
    });
    this.target.append(notification);
    return this;
  }
}

export default Notification;
