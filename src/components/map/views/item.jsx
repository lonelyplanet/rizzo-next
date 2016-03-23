import React from "react";
import MapActions from "../actions";

/**
 * Items on the map, or in the sidebar
 * @type {*|Function}x
 */
export default class ItemView extends React.Component {
  render() {
    let item = this.props.item,
        title = item.title,
        classString = "place ",
        picClass = "place__pic",
        imgStyle;

    if (item.onMap) {
      classString += "pin";
      if (title.length > 23) {
        title = title.substr(0, 22) + "…";
      }
    } else {
      classString += "list";
      if (item.highlighted) {
        classString += " is-hovered";
      }
      if (title.length > 36) {
        title = title.substr(0, 35) + "…";
      }
    }
    if (item.geo.properties.thumbnail) {
      let imgSrc = item.geo.properties.thumbnail;
      imgStyle = { backgroundImage: `url(${imgSrc})` };
    }
    else {
      // TODO: This will have to change when topics are correct
      let type = this.props.item.item_type === "Place" ? "sight" : "activity";
      picClass += ` topic__image topic__image--${type}`;
    }

    let subtitle;
    if (item.subtitle) {
      subtitle = <div className="subtitle">{item.subtitle}</div>;
    }

    return (
      <div className={classString} onMouseEnter={this.hoverItem.bind(this)} onClick={this.clickItem.bind(this)}>
        <div className="place__pointer"></div>
        <div className={picClass} style={imgStyle}>
        </div>
        <div className="place__marker">{item.i+1}</div>
        <div className="place__text">
          <div className="title">{title}</div>
          {subtitle}
        </div>
        <div className="place__icon">
          <i className="icon icon-chevron-right" aria-hidden="true"></i>
        </div>
      </div>
    );
  }

  clickItem() {
    let props = this.props;
    if(props.item.item_type === "Place") {
      MapActions.gotoPlace({ place: props.item.slug, placeTitle: props.item.title, breadcrumb: props.item.subtitle });
    } else {
      MapActions.poiOpen({ index: props.item.i, poi: props.item });
      MapActions.pinHover({ poiIndex: props.item.i });
    }
  }

  hoverItem() {
    let props = this.props;
    MapActions.pinHover({ poiIndex: props.item.i });
  }
}
