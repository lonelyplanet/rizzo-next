import React from "react";
import MapActions from "../actions";
import InteractiveMap from "../interactive-map";

/**
 * The main component for the map view
 */
export default class MapView extends React.Component {
  componentDidMount() {
    this.interactiveMap = new InteractiveMap({
      el: this.refs.map.getDOMNode()
    });
    MapActions.initMap();
  }
  render() {
    return (
      <div ref="map" className="map-container">Map goes here</div>
    )
  }

}
