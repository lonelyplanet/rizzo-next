import { Component } from "../../../core/bane";
import MapboxMarkerSet from "./markerset";
import "mapbox.js";

let L = window.L;
let mapID = "lonelyplanet.3d9e3afc";

L.mapbox.accessToken = "pk.eyJ1IjoibG9uZWx5cGxhbmV0IiwiYSI6Imh1ODUtdUEifQ.OLLon0V6rcoTyayXzzUzsg";

class MapProvider extends Component {
  initialize() {
    this.layer = L.mapbox.featureLayer();
  }

  launch() {
    let options = {
      zoomControl: true,
      scrollWheelZoom: false
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
