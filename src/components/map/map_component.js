import { Component } from "../../core/bane";
import React from "react";
import MainView from "./views/main.jsx";
import MapActions from "./actions";
import Arkham from "../../core/arkham"

class MapComponent extends Component {

  initialize(props) {
    let originalState = this.getInitialState();
    this.el = props.el;

    let fullscreen = $(this.el).parent().data("fullscreen");

    MapActions.setState(originalState.data);

    React.render(<MainView />, document.querySelector(this.el));

    Arkham.on("map.closed", () => {
      this.close();
    });

    MapActions.fetchSponsors();
  }

  open() {
    this.$el.addClass("open");
    $("html,body").addClass("noscroll");
    MapActions.mapOpen();
  }

  close() {
    $("html,body").removeClass("noscroll");
    this.$el.removeClass("open");
  }

}

export default MapComponent;
