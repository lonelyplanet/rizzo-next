import $ from "jquery";
import Arkham from "../../core/arkham";
import { Component } from "../../core/bane";
import MapActions from "./actions";
import MapState from "./state";
import MapAPI from "./api";

/**
 * Wrapper around the map element
 */
class InteractiveMap extends Component {

  initialize() {
    Arkham.on("map.init", () => {
      this.launch();
      this.changeView();
    });

    Arkham.on("view.changed", () => {
      this.$el.off("click.poi");
      this.changeView();
    });

    Arkham.on("place.fetched", () => {
      this.changeView();
    });
  }

  launch() {
    MapAPI.launch(this.$el);
  }

  kill() {
    MapAPI.kill();
  }

  changeView() {
    let state = MapState.getState();
    let pois = state.sets[state.activeSetIndex].items;

    MapAPI.redraw(pois);
  }

  hasFetched() {
    let state = MapState.getState();
    let pois = state.sets[state.activeSetIndex].items;
    MapAPI.plot(pois);
  }

  pinClick(e) {
    let pinType = $(e.currentTarget).data("pintype");

    if(pinType === "poi") {
      let data = {
        poi: $(e.currentTarget).data("poi")
      };
      MapActions.poiOpen(data);
    } else {
      let data = {
        place: $(e.currentTarget).data("place")
      };
      MapActions.gotoPlace(data);
    }
  }

}

export default InteractiveMap;
