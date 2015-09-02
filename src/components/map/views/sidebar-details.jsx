import React from "react";
import MapActions from "../actions";

export default class SidebarDetailsView extends React.Component{
  componentDidMount() {
    if (this.refs.img) {
      let el = this.refs.img.getDOMNode();
      resrc.run(el);
    }
  }
  render() {
    let poi = this.props.poi;
    let image = "";

    if (poi.geo.properties.image) {
      image = <div className="details__image">
        <img data-src={poi.geo.properties.image} ref="img" />
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
          <div className="panel__content" dangerouslySetInnerHTML={{__html: poi.description}}></div>
          <div className="panel__footer">
            <a className="panel__close" href={poi.slug}>
              Close map and explore {poi.title}
              <span className="icon-chevron-right"></span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  closePOI(e) {
    e.preventDefault();
    MapActions.poiClose();
  }

}
