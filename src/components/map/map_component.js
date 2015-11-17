import { Component } from "../../core/bane";
import React from "react";
import MainView from "./views/main.jsx";
import MapActions from "./actions";
import Arkham from "../../core/arkham";
import { createHistory } from "history";
import $ from "jquery"; 
import MapApi from "./map_api";

let history = createHistory();

class MapComponent extends Component {

  initialize() {
    MapApi.fetch(`/${window.lp.place.slug}/map.json`).done((results) => {
      MapActions.setState(results);
      React.render(<MainView />, this.$el[0]);
    });

    Arkham.on("map.closed", () => {
      this.close();
    });

    $("body").on("keyup", this.onKeyup.bind(this));
  }

  open() {
    this.$el.addClass("open");
    $("html,body").addClass("noscroll");
    MapActions.mapOpen();

    if (!this.isOnMap()) {
      let pathname = this.getMapPath();
      history.pushState({}, `${pathname}map/`);
    }
  }

  isOnMap() {
    return /map\/?$/.test(window.location.pathname);
  }

  getMapPath() {
    let pathname = window.location.pathname;
    let lastChar = window.location.pathname.substr(-1); // Selects the last character
    
    if (lastChar !== "/") {         // If the last character is not a slash
       pathname = pathname + "/";   // Append a slash to it.
    }

    return pathname;
  }

  close() {
    $("html,body").removeClass("noscroll");
    this.$el.removeClass("open");

    let path = window.location.pathname.replace(/map\/?$/, "");
    history.pushState({}, `${path}`);
  }

  onKeyup(e) {
    if (e.keyCode === 27) {
      this.close();
    }
  }

}

export default MapComponent;
