import { Component } from "../../../core/bane";
import MapActions from "../actions";
import MapState from "../state";
import React from "react";
import Pin from "../views/pin.jsx";
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import Arkham from "../../../core/arkham";
import debounce from "lodash/debounce";

class MarkerSet extends Component {

  initialize({ pois, map, layer }) {
    this.events = {
      "click.marker .pin": "_poiClick"
    };

    this.markerIcons = ["sights", "restaraunts", "shopping"];

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
    Arkham.on("map.poihover", (data) => {
      const poi = this.pois[data.poiIndex];
      this.popup.setLngLat(poi.geo.geometry.coordinates)
        .setDOMContent(this._createIcon(poi.geo.properties.index))
        .addTo(this.map);
      MapActions.itemHighlight(data.poiIndex);
    });

    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    this.map.on("mousemove", debounce(this._poiHover.bind(this), 100));
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
          "marker-symbol": this._getCategoryIcon(geo.properties.category.toLowerCase())
        });

        geojson.features.push(geo);
      }
    }

    return geojson;
  }

  _getCategoryIcon(category) {
    return this.markerIcons.indexOf(category) > -1 ? category : "sights";
  }

  createMarkers(pois) {
    this.pois = pois;

    const geoJson = this._createGeoJSON();
    this.source.setData(geoJson);

    this.map.flyTo({
      center: geoJson.features[0].geometry.coordinates,
    });

    const bounds = new mapboxgl.LngLatBounds();

    geoJson.features.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates);
    });

    this.map.fitBounds(bounds, { padding: 100, maxZoom: 20, });
  }

  _createIcon(markerIndex) {
    let state = MapState.getState();
    // If there"s no active set for the current view, use the first set
    let index = state.sets[state.activeSetIndex] ?
      state.activeSetIndex :
      state.lastActiveSetIndex;

    let set = state.sets[index || 0];

    if (!set) {
      return "";
    }

    let pin = set.items[markerIndex];

    if (!pin) {
      return "";
    }

    let poi = { pin: pin };
    let markup = React.renderToStaticMarkup(React.createElement(Pin, poi));

    const $el = $(markup);
    $el.attr("data-poi", markerIndex);

    return $el[0];
  }

  _poiHover(e) {
    let features;
    try {
      features = this.map.queryRenderedFeatures(e.point, { layers: ["markers"] });
    } catch(error) {
      features = this._getClosestFeatures(e.lngLat.lng, e.lngLat.lat);
    }

    if (!features.length) {
        this.popup.remove();
        return;
    }

    // Change the cursor style as a UI indicator.
    this.map.getCanvas().style.cursor = (features.length) ? "pointer" : "";

    const feature = features[0];

    // Populate the popup and set its coordinates
    // based on the feature found.
    const icon = this._createIcon(feature.properties.index);

    if (!icon) {
      return;
    }

    this.popup.setLngLat(feature.geometry.coordinates)
      .setDOMContent(icon)
      .addTo(this.map);

    MapActions.itemHighlight(feature.properties.index);
  }

  _toRadians(deg) {
    return deg * Math.PI / 180;
  }

  _equirectangularDistance(lng1, lat1, lng2, lat2) {
    let x = (lng1 - lng2) * Math.cos((lat1 + lat2)/2);
    let y = (lat1 - lat2);
    return (Math.sqrt(x*x + y*y) * 6371);
  }

  _getClosestFeatures(lng1, lat1) {
    let minDistance = 1000000;
    let minIndex = 0;
    lng1 = this._toRadians(lng1);
    lat1 = this._toRadians(lat1);
    for (let i = 0, l = this.pois.length; i < l; i++) {
      let geo = this.pois[i].geo;
      let lng2 = this._toRadians(geo.geometry.coordinates[0]);
      let lat2 = this._toRadians(geo.geometry.coordinates[1]);
      let distance = this._equirectangularDistance(lng1, lat1, lng2, lat2);

      if (distance < minDistance) {
        minDistance = distance;
        minIndex = i;
      }
    }
    if (minDistance < (20 - this.map.getZoom())/10) {
      return [(this.pois[minIndex]).geo];
    } else {
      return [];
    }
  }

  _poiClick(event) {
    const poiIndex = $(event.currentTarget).data("poi");
    this._goTo(poiIndex);
  }

  _goTo(poiIndex) {
    const poi = this.pois[poiIndex];

    if (poi.item_type === "Place") {
      MapActions.gotoPlace({
        place: poi.slug,
        placeTitle: poi.title,
        breadcrumb: poi.subtitle
      });
    } else {
      MapActions.poiOpen({
        index: poiIndex, poi
      });
    }
  }
}

export default MarkerSet;
