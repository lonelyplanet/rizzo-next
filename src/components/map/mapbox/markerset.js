import { Component } from "../../../core/bane";
import MapActions from "../actions";
import MapState from "../state";
import React from "react";
import Pin from "../views/pin.jsx";
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";

class MarkerSet extends Component {

  initialize({ pois, map, layer }) {
    this.events = {
      "click.marker .pin": "_poiClick"
    };

    this.pois = pois;
    this.map = map;
    this.layer = layer;

    this.listen();

    this.source = new mapboxgl.GeoJSONSource();
    this.map.addSource("markers", this.source);

    this.map.addLayer({
      "id": "markers",
      "type": "symbol",
      "source": "markers",
      "layout": {
        "icon-image": "{marker-symbol}_poi",
        "icon-allow-overlap": true,
        "text-font": ["LPBentonSans Bold"],
        "text-field": "{name}",
        "text-anchor": "top",
        "text-size": 12,
        "text-offset": [0, 1.25]
      },
      paint: {
        "text-color": "#3a434e",
        "text-halo-color": "#fff",
        "text-halo-width": 2
      },
    });
  }

  listen() {
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    this.map.on("mousemove", this._poiHover.bind(this));
  }

  _createGeoJSON() {
    let geojson = {
      type: "FeatureCollection",
      features: []
    };

    for (let i = 0, l = this.pois.length; i < l; i++) {
      let geo = this.pois[i].geo;

      if(geo.geometry.coordinates[0] === null || geo.geometry.coordinates[1] === null) {
        continue;
      } else {
        geo.properties.index = i;

        Object.assign(geo.properties, {
          index: i,
          title: this.pois[i].name,
          "marker-symbol": geo.properties.category || "sights"
        });

        geojson.features.push(geo);
      }
    }

    return geojson;
  }

  clearMarkers() {
    // this.map.removeLayer("markers");
  }

  createMarkers(pois) {
    this.pois = pois;

    const geoJson = this._createGeoJSON();
    this.source.setData(geoJson);

    this.map.flyTo({ center: geoJson.features[0].geometry.coordinates });

    const bounds = new mapboxgl.LngLatBounds();

    geoJson.features.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates);
    });

    this.map.fitBounds(bounds, { padding: 100 });
  }

  _createIcon(markerIndex) {
    let state = MapState.getState();
    // If there"s no active set for the current view, use the first set
    let index = state.sets[state.activeSetIndex] ?
      state.activeSetIndex :
      state.lastActiveSetIndex;

    let set = state.sets[index || 0];

    if (!set) {
      return;
    }

    let pin = set.items[markerIndex];
    let poi = { pin: pin };
    let markup = React.renderToStaticMarkup(React.createElement(Pin, poi));

    return markup;
  }

  _poiHover(e) {
    const features = this.map.queryRenderedFeatures(e.point, { layers: ["markers"] });

    if (!features.length) {
        this.popup.remove();
        return;
    }

    // Change the cursor style as a UI indicator.
    this.map.getCanvas().style.cursor = (features.length) ? "pointer" : "";

    const feature = features[0];

    // Populate the popup and set its coordinates
    // based on the feature found.
    this.popup.setLngLat(feature.geometry.coordinates)
      .setHTML(this._createIcon(feature.properties.index))
      .addTo(this.map);

    MapActions.itemHighlight(feature.properties.index);
  }

  _poiClick(event) {
    let poiIndex = (event.layer || this.activeLayer).feature.properties.index,
        poi = this.pois[poiIndex];

    if (poi.item_type === "Place") {
      MapActions.gotoPlace({ place: poi.slug, placeTitle: poi.title, breadcrumb: poi.subtitle });
    } else {
      MapActions.poiOpen({ index: poiIndex, poi });
    }
  }
}

export default MarkerSet;
