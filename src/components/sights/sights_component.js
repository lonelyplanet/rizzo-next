import Component from "../../core/component";
import subscribe from "../../core/decorators/subscribe";

export default class Sights extends Component {
  initialize() {
    this.subscribe();
  }

  @subscribe("ttd.removed", "components");
  _changeTitle() {
    this.$el.find(".js-sights-heading").toggleClass("sights__heading--large");
  }
}
