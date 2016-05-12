import { Component } from "../../../core/bane";
import MapboxMarkerSet from "./markerset";
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import "mapbox-gl/dist/mapbox-gl.css";

import MapState from "../state";

mapboxgl.accessToken = "pk.eyJ1IjoibG9uZWx5cGxhbmV0IiwiYSI6Imh1ODUtdUEifQ.OLLon0V6rcoTyayXzzUzsg";

class MapProvider extends Component {
  initialize() {
    this.$el.attr("id", "map");
  }

  launch() {
    const state = MapState.getState();

    this.map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/lonelyplanet/cin7ounjn0050bckvcebvti2h?v2", //stylesheet location
        zoom: 9, // starting zoom
        center: (state.userLocation || state.currentLocation.geo.geometry.coordinates).reverse(),
        zoomControl: true,
    });

    return this.map;
  }

  kill() {
    this.map.remove();
  }

  addMarkers(pois) {
    this.markers = this.markers || new MapboxMarkerSet({
      el: this.el,
      map: this.map,
      pois: pois
    });
    this.markers.createMarkers(pois);
  }

  removeMarkers() {
    if (this.markers) {
      this.markers.clearMarkers();
    }
  }
}

export default MapProvider;
