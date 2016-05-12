import React from "react";
import InteractiveMap from "../interactive-map";

/**
 * The main component for the map view
 */
export default class MapView extends React.Component {
  componentDidMount() {
    this.interactiveMap = new InteractiveMap({
      el: this.refs.map.getDOMNode()
    });
  }
  render() {
    return (
      <div ref="map" className="map-container"></div>
    );
  }

}
