import MapProvider from "./mapbox";
import MapActions from "./actions";

let MapAPI = {
  /**
   * Setup the map on an element
   * @param el
   */
  launch: function(el) {
    this.mapProvider = new MapProvider({
      el: el
    });
    const map = this.mapProvider.launch();
    map.on("load", () => {
      MapActions.initMap();
    });
  },
  /**
   * Destroy the map
   */
  kill: function() {
    this.mapProvider.kill();
  },
  /**
   * Redraw the map with a new list of POIS
   * @param {Array} pois
   */
  redraw: function(pois) {
    this.clear();
    this.plot(pois);
  },
  /**
   * Plots out an array of POIs
   * @param {Array} pois
   */
  plot: function(pois) {
    this.mapProvider.addMarkers(pois);
  },
  /**
   * Remove all map markers
   */
  clear: function() {
    this.mapProvider.removeMarkers();
  }

};

export default MapAPI;
