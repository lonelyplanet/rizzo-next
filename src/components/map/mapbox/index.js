import { Component } from "../../../core/bane";
import MapboxMarkerSet from "./markerset";
import "mapbox.js";

let L = window.L;
let mapID = "lonelyplanet.04cf7895";

L.mapbox.accessToken = "pk.eyJ1IjoibG9uZWx5cGxhbmV0IiwiYSI6ImNpajYyZW1iMjAwOG51bWx2YW50ejNmN2IifQ.neyeEEzBkaNKcKUzCe3s2Q";

class MapProvider extends Component {
  initialize() {
    this.layer = L.mapbox.featureLayer();
  }

  launch() {
    let options = {
      zoomControl: true,
      scrollWheelZoom: true
    };
    this.map = L.mapbox.map(this.$el[0], mapID, options);
  }

  kill() {
    this.map.remove();
  }

  addMarkers(pois) {
    this.markers = new MapboxMarkerSet({
      el: this.el,
      map: this.map,
      layer: this.layer,
      pois: pois
    });
  }

  removeMarkers() {
    delete this.markers;
  }

  removePopup() {
    this.map.closePopup();
  }

}

export default MapProvider;
