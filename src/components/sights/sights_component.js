import Component from "../../core/component";
import subscribe from "../../core/decorators/subscribe";

export default class Sights extends Component {
  initialize() {
    this.subscribe();
  }
  @subscribe("ttd.removed", "components")
  _changeTitle() {
    this.$el.find(".sights__heading").toggleClass("is-hidden");
  }
}
