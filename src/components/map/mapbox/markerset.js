import { Component } from "../../../core/bane";
import Arkham from "../../../core/arkham";
import MapActions from "../actions";
import MapState from "../state";
import React from "react";
import Pin from "../views/pin.jsx";

import "mapbox.js";

let L = window.L;

class MarkerSet extends Component {

  initialize({ pois, map, layer }) {
    this.events = {
      // "click.marker .poi": "_poiClick", doesn't work, because marker is z-indexed lower than popup-pane?
      "click.marker .pin": "_poiClick"
    };

    this.pois = pois;
    this.map = map;
    this.layer = layer;

    this.listen();

    this._createLayer();
    this._clearMarkers();
    this._createGeoJSON();
    this._addIcons();

    this.layer.addTo(this.map);
    this.map.fitBounds(this.layer.getBounds(), { padding: [ 50, 50 ], maxZoom:  14 });
  }

  listen() {
    let _this = this;

    Arkham.on("map.poihover", (data) => {
      let layer = _this._findLayerByIndex(data.poiIndex);
      _this._poiHover(layer);
    });

    Arkham.on("map.poiunhover", (data) => {
      let layer = _this._findLayerByIndex(data.poiIndex);
      _this._poiUnhover(layer);
    });

  }

  _findLayerByIndex(i) {
    let l;

    this.layer.eachLayer(function(layer) {
      if (layer.feature.properties.index === (i)) {
        l = layer;
      }
    });

    return l;
  }

  _createGeoJSON() {
    let geojson = {
      type: "FeatureCollection",
      features: []
    };

    for (let i = 0, l = this.pois.length; i < l; i++) {
      let geo = this.pois[i].geo;

      if(geo.geometry.coordinates[0] === null || geo.geometry.coordinates[1] === null) {
        continue
      } else {
        geo.properties.index = i;
        geojson.features.push(geo);
      }
    }

    this.layer.setGeoJSON(geojson);
  }

  _addIcons() {
    this.layer.eachLayer(function(l) {
      let myIcon = L.divIcon({
        className: "poi js-poi",
        iconSize: [14, 14]
      });

      l.setIcon(myIcon);
    });
  }

  _createIcon(layer) {
    let state = MapState.getState();
    // If there's no active set for the current view, use the first set
    let index = state.sets[state.activeSetIndex] ?
      state.activeSetIndex :
      state.lastActiveSetIndex;

    let set = state.sets[index || 0];

    if (!set) {
      return;
    }

    let pin = set.items[layer.feature.properties.index];
    let poi = { pin: pin };
    let markup = React.renderToStaticMarkup(React.createElement(Pin, poi));
    // let pin = PinTemplate(layer.feature.properties);
    return markup;
  }

  _clearMarkers() {
    this.layer.setGeoJSON([]);
  }

  _createLayer() {
    this.layer
      .off("mouseover")
      .off("mouseout");

    this.layer
      .on("mouseover", (e) => {
        this._poiHover(e.layer);
      })
      .on("mouseout", (e) => {
        this._poiUnhover(e.layer);
      });
    
    this.layer.off("click");
    this.layer.on("click", (e) => {
      this._poiClick(e);
    });
  }

  _poiHover(layer) {
    // this._fixzIndex(layer); Not needed since pop-ups moved off the markers?
    let template = this._createIcon(layer);
    let lat = layer._latlng.lat;
    let lng = layer._latlng.lng;

    this.popup = L.popup({
        closeButton: false,
        keepInView: true,
        offset: L.point(0, -25)
      })
      .setLatLng(L.latLng(lat, lng))
      .setContent(template)
      .openOn(this.map);

    let poiIndex = layer.feature.properties.index;
    MapActions.itemHighlight(poiIndex);
  }

  // A layer argument is passed in, but it is not used
  // The defined argument has been removed to pass ESLint
  _poiUnhover(layer) {
    // Use if needed
    this.activeLayer = layer;
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

  _fixzIndex(currentLayer) {
    this.layer.eachLayer(function(layer) {
      layer._icon.style.zIndex = layer._icon._leaflet_pos.y;
    });
    currentLayer._icon.style.zIndex = currentLayer._icon._leaflet_pos.y + currentLayer.options.zIndexOffset + 60;
  }

}

export default MarkerSet;
