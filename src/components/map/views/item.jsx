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
    let imageSrc = "http://placehold.it/350x150";
    if (item.onMap) {
      classString += "pin";
    } else {
      classString += "list";
    }
    if (item.geo.properties.image) {
      imageSrc = "http://images-resrc.staticlp.com/S=H150/" + item.geo.properties.image;
    }
    if (title.length > 35) {
      title = title.substr(0, 34) + "...";
    }

    let subtitle;
    if (item.subtitle) {
      subtitle = <div className="subtitle">{item.subtitle}</div>;
    }

    return (
      <div className={classString} onClick={this.clickItem.bind(this)}>
        <div className="place__pic">
          <img src={imageSrc} />
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
    }
  }
}
