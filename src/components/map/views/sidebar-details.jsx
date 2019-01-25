import React from "react";
import MapActions from "../actions";
import $clamp from "clamp-js/clamp.js";

export default class SidebarDetailsView extends React.Component{
  constructor(props) {
    super(props);

    this.setPoitTitleRef = el => this.poiTitle = el;

  }
  componentDidMount() {
    $clamp(this.poiTitle, { clamp: 2 });
  }

  render() {
    let poi = this.props.poi,
        image = "",
        // TODO Switch back to just ${poi.slug} once this is live
        slug = `https://www.lonelyplanet.com/${poi.slug}`;

    if (poi.geo.properties.image) {
      let imgSrc = poi.geo.properties.image;
      image = <div className="details__image">
        <img src={imgSrc} ref="img" />
      </div>;
    }

    let footer = <div className="panel__footer dooda"><a className="panel__close" href={slug}>Close map and explore this destination<span className="icon-chevron-right"></span></a></div>;

    return (
      <div className="sidebar details">
        <header className="sidebar__header">
          <a href="#" className="close-poi location-subtitle" onClick={this.closePOI}><i className="icon icon-chevron-left" aria-hidden="true"></i>Back</a>
          <h1 ref={this.setPoitTitleRef} className="sidebar__title">
            {poi.title}
          </h1>
        </header>
        <div className="panel">
          {image}
          <div className="panel__content" dangerouslySetInnerHTML={{__html: poi.description}}></div>
        </div>
        {footer}
      </div>
    );
  }

  closePOI(e) {
    e.preventDefault();
    MapActions.poiClose();
  }

}
