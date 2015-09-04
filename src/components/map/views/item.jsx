import React from "react";
import MapActions from "../actions";

/**
 * Items on the map, or in the sidebar
 * @type {*|Function}x
 */
export default class ItemView extends React.Component {
  render() {
    let item = this.props.item;
    let title = item.title;
    let classString = "place ";
    let img = "";
    let picClass = "place__pic";

    if (item.onMap) {
      classString += "pin icon icon--chevron-right";
    } else {
      classString += "list";
      if (item.highlighted) {
        classString += " is-hovered";
      }
    }
    if (item.geo.properties.image) {
      let imgSrc = "http://images-resrc.staticlp.com/S=H150/" + item.geo.properties.image;
      img = <img src={imgSrc} />
    }
    else {
      // TODO: This will have to change when topics are correct
      let type = this.props.item.item_type === "Place" ? "sight" : "activity";
      picClass += ` topic__image topic__image--${type}`;
    }
    if (title.length > 30) {
      title = title.substr(0, 29) + "...";
    }

    let subtitle;
    if (item.subtitle) {
      subtitle = <div className="subtitle">{item.subtitle}</div>;
    }

    return (
      <div className={classString} onClick={this.clickItem.bind(this)}>
        <div className="place__pointer"></div>
        <div className="place__pointer--shadow"></div>
        <div className={picClass}>
          {img}
        </div>
        <div className="place__order">{item.i+1}</div>
        <div className="place__text">
          <div className="title">{title}</div>
          {subtitle}
        </div>
      </div>
    );
  }

  clickItem() {
    let props = this.props;
    if(props.item.item_type === "Place") {
      MapActions.gotoPlace({ place: props.item.slug, placeTitle: props.item.title });
    } else {
      MapActions.poiOpen({ index: props.item.i });
      MapActions.pinHover({ poiIndex: props.item.i });
    }
  }
}
