import { Component } from "../../core/bane";
import React from "react";
import MainView from "./views/main.jsx";
import MapActions from "./actions";
import InteractiveMap from "./interactive-map";

class MapComponent extends Component {

  initialize(props) {
    let originalState = this.getInitialState();
    this.el = props.el;

    MapActions.setState(originalState.data);

    React.render(<MainView />, document.querySelector(this.el));

    this.interactiveMap = new InteractiveMap({
      el: this.el
    });
    MapActions.initMap();
  }

  open() {
    this.$el.addClass("open");
    $("html,body").addClass("noscroll");
    MapActions.mapOpen();
  }

  close() {
    $("html,body").removeClass("noscroll");
    this.$el.removeClass("open");
    MapActions.close();
  }

}

export default MapComponent;
