import { Component } from "../../core/bane";
import React from "react";
import { render } from "react-dom";
import MainView from "./views/main.jsx";
import MapActions from "./actions";
import Arkham from "../../core/arkham";
import { createHistory } from "history";
import $ from "jquery";
import MapApi from "./map_api";
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import rizzo from "../../rizzo";

let history = createHistory();

export default class MapComponent extends Component {

  initialize() {
    rizzo.logger.log("Creating map");

    if (!MapComponent.supported) {
      return false;
    }

    this.fetchMap();

    Arkham.on("map.closed", () => {
      this.close();
    });

    $("body").on("keyup", this.onKeyup.bind(this));

    this.updateMapHistory();
  }

  fetchMap() {
    MapApi.fetch(`/${window.lp.place.slug}/map.json`).done((results) => {
      MapActions.setState(results);
      render(
        <MainView />
      , this.$el[0]);
      this.open();
    });
  }

  updateMapHistory() {
    window.onpopstate = (event) => {
      let hasState = event.state && event.state.isOnMap,
          isOnMap = this.isOnMap();

      if(hasState || (!hasState && isOnMap)) {
        this.createMap();
      } else {
        this.destroyMap();
      }
    };
  }

  createMap() {
    $("html, body").addClass("noscroll");
    this.$el.addClass("open");
    MapActions.mapOpen();
  }

  destroyMap() {
    $("html, body").removeClass("noscroll");
    this.$el.removeClass("open");
  }

  open() {
    this.createMap();

    if (!this.isOnMap()) {
      let pathname = this.getMapPath();

      history.push({
        pathname: `${pathname}map`,
        state: { isOnMap: true }
      });
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
    this.destroyMap();

    let path = window.location.pathname.replace(/\/map\/?$/, "");

    history.push({
      pathname: `${path}`,
      state: { isOnMap: false }
    });
  }

  onKeyup(e) {
    if (e.keyCode === 27) {
      this.close();
    }
  }

}

MapComponent.supported = mapboxgl.supported();
