import React from "react";
import MapActions from "../actions";

export default class SidebarDetailsView extends React.Component{

  render() {
    let poi = this.props.poi;
    let image = "";
    console.log("Render", poi.geo.properties.image);

    if (poi.geo.properties.image) {
      let imgSrc = `http://images-resrc.staticlp.com/s=w470,pd1/o=85/${poi.geo.properties.image}`;
      image = <div className="details__image">
        <img src={imgSrc} ref="img" />
      </div>
    }

    return (
      <div className="sidebar details">
        <header className="sidebar__header">
          <a href="#" className="close-poi location-subtitle" onClick={this.closePOI}>&lt; Back</a>
          <h1 className="sidebar__title">
            {poi.title}
          </h1>
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
