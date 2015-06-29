import { Component } from "../../core/bane";

class ThingsToDo extends Component {
  initialize() {
    this.events = {
      "click .js-ttd-item": "goToThing"
    };
  }
  goToThing(e) {
    window.location = $(e.currentTarget).find("a").attr("href");
  }
}

export default ThingsToDo;
