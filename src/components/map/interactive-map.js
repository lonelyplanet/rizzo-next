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
      this.changeView();
    });
  }

  launch() {
    MapAPI.launch(this.$el.find(".map-container"));
  }

  kill() {
    MapAPI.kill();
  }

  changeView() {
    let state = MapState.getState();
    let pois = state.sets[state.activeSetIndex].items;

    MapAPI.redraw(pois);
  }

  isFetching() {
    MapAPI.clear();
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
