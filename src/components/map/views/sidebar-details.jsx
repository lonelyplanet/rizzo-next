import React from "react";
import MapActions from "../actions";

export default class SidebarDetailsView extends React.Component{
  render() {
    let poi = this.props.poi;
    let image = "";

    if (poi.geo.properties.image) {
      image = <div className="details__image" ref="slideshow">
        <img src={poi.geo.properties.image} />
      </div>
    }

    return (
      <div className="sidebar details">
        <header className="sidebar-header">
          <h1>
            {poi.title}
          </h1>
          <h3>{poi.subtitle}</h3>
          <a href={poi.slug} className="lp-link">Go to POI page on LP</a>
          <a href="#" className="close-poi" onClick={this.closePOI}>&lt; Go Back</a>
        </header>
        <div className="panel">
          {image}
          <div className="poi-body" dangerouslySetInnerHTML={{__html: poi.description}}></div>
        </div>
      </div>
    )
  }

  closePOI(e) {
    e.preventDefault();
    MapActions.poiClose();
  }

}
