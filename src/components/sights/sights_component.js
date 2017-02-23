import Component from "../../core/component";
import subscribe from "../../core/decorators/subscribe";

export default class Sights extends Component {
  initialize() {
    let sights = this.getInitialState();
    this.sightsList = require("./sights_list.hbs");
    this.$el.find(".js-sights-list").replaceWith(this.sightsList(sights));
    this.subscribe();
  }

  @subscribe("experiences.removed", "components")
  _changeTitle() {
    this.$el.find(".js-sights-heading").toggleClass("sights__heading--large");
  }
}
