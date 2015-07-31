import { Component } from "../../../core/bane";
import Arkham from "../../../core/arkham";
import MapActions from "../actions";
import PinTemplate from "./pin.html.hbs";
import MapState from "../state";
import React from "react";
import Pin from "../views/pin.jsx";

import "mapbox.js";

let L = window.L;

class MarkerSet extends Component {

  initialize(options) {

    this.pois = options.pois;
    this.map = options.map;
    this.layer = options.layer;

    this.listen();

    this._createLayer();
    this._clearMarkers();
    this._createGeoJSON();
    this._addIcons();

    this.layer.addTo(this.map);
    this.map.fitBounds(this.layer.getBounds(), { padding: [ 50, 50 ] });
  }

  listen() {
    let _this = this;
    Arkham.on("map.poihover", (data) => {
      var layer = _this._findLayerByIndex(data.poiIndex);
      _this._poiHover(layer);
    });

    Arkham.on("map.poiunhover", (data) => {
      var layer = _this._findLayerByIndex(data.poiIndex);
      _this._poiUnhover(layer);
    });

  }

  _findLayerByIndex(i) {
    let l;
    this.layer.eachLayer(function(layer) {
      if (layer.feature.properties.poiIndex === (i + 1)) {
        l = layer;
      }
    });
    return l;
  }

  _createGeoJSON() {
    let i,
        l = this.pois.length,
        geojson = {
          type: "FeatureCollection",
          features: []
        };

    for (i = 0; i < l; i++) {
      var geo = this.pois[i].geo;
      if(geo.geometry.coordinates[0] === null || geo.geometry.coordinates[0] === null) {
        geo.geometry.coordinates = [0,0];
      }
      geo.properties.index = i;
      geojson.features.push(geo);
    }
    this.layer.setGeoJSON(geojson);
  }

  _addIcons() {
    let _this = this;
    this.layer.eachLayer(function(l) {
      let myIcon = L.divIcon({
        className: "poi js-poi"
      });
      l.setIcon(myIcon);
    });
  }

  _createIcon(layer) {
    let state = MapState.getState();
    let pin = state.sets[state.activeSetIndex].items[layer.feature.properties.index];
    pin.onMap = true;
    let poi = { pin: pin };
    var markup = React.renderToStaticMarkup(React.createElement(Pin, poi));
    // let pin = PinTemplate(layer.feature.properties);
    return markup;
  }

  _clearMarkers() {
    this.layer.setGeoJSON([]);
  }

  _createLayer() {
    var _this = this;
    this.layer.on("mouseover", function(e) {
      _this._poiHover(e.layer);
    })
    .on("mouseout", function(e) {
      _this._poiUnhover(e.layer);
    })
    .on("click", function(e) {
      _this._poiClick(e.layer);
    });
  }

  _poiHover(layer) {
    this._fixzIndex(layer);
    let template = this._createIcon(layer);
    let lat = layer._latlng.lat;
    let lng = layer._latlng.lng;
    this.popup = L.popup({
        closeButton: false,
        keepInView: true,
        offset: L.point(115, 30)
      })
      .setLatLng(L.latLng(lat, lng))
      .setContent(template)
      .openOn(this.map);
  }

  _poiUnhover(layer) {
  }

  _poiClick(layer) {
    // figure out if a PLACE or a POI
    MapActions.poiOpen(layer.feature.properties);
  }

  _fixzIndex(currentLayer) {
    this.layer.eachLayer(function(layer) {
      layer._icon.style.zIndex = layer._icon._leaflet_pos.y;
    });
    currentLayer._icon.style.zIndex = currentLayer._icon._leaflet_pos.y + currentLayer.options.zIndexOffset + 60;
  }

}

export default MarkerSet;
