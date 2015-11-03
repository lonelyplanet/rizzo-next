import React from "react";
import MapActions from "../actions";
import $clamp from "clamp-js/clamp.js";

export default class SidebarDetailsView extends React.Component{
  componentDidMount() {
    let el = this.refs.poiTitle.getDOMNode();

    $clamp(el, { clamp: 2 });
  }
  render() {
    let poi = this.props.poi;
    let image = "";

    if (poi.geo.properties.image) {
      let imgSrc = `http://images-resrc.staticlp.com/s=w470,pd1/o=85/${poi.geo.properties.image}`;
      image = <div className="details__image">
        <img src={imgSrc} ref="img" />
      </div>
    }
    let slug = `/${poi.slug}`;
    return (
      <div className="sidebar details">
        <header className="sidebar__header">
          <a href="#" className="close-poi location-subtitle" onClick={this.closePOI}><i className="icon icon-chevron-left" aria-hidden="true"></i>Back</a>
          <h1 ref="poiTitle" className="sidebar__title">
            {poi.title}
          </h1>
        </header>
        <div className="panel">
          {image}
          <div className="panel__content" dangerouslySetInnerHTML={{__html: poi.description}}></div>
          <div className="panel__footer">
            <a className="panel__close" href={slug}>
              Close map and explore this destination
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
