import React from "react";
import InteractiveMap from "../interactive-map";

/**
 * The main component for the map view
 */
export default class MapView extends React.Component {
  componentDidMount() {
    this.interactiveMap = new InteractiveMap({
      el: this.map
    });
  }

  render() {
    return (
      <div ref={(node) => this.map = node} className="map-container"></div>
    );
  }

}
