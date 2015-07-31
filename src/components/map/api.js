import MapProvider from "./mapbox";

let MapAPI = {

  launch: function(el) {
    this.mapProvider = new MapProvider({
      el: el
    });
    this.mapProvider.launch();
  },

  kill: function() {
    this.mapProvider.kill();
  },

  redraw: function(pois) {
    this.clear();
    this.plot(pois);
  },

  plot: function(pois) {
    this.mapProvider.addMarkers(pois);
    // clear map and replot with new pins
  },

  clear: function() {
    // empty map of all pins
    this.mapProvider.removeMarkers();
  }

};

export default MapAPI;
