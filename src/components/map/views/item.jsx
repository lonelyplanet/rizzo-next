import React from "react";
import MapActions from "../actions";

/**
 * Items on the map, or in the sidebar
 * @type {*|Function}x
 */
export default class ItemView extends React.Component {

  render() {
    let item = this.props.item;
    let classString = "place ";

    if (item.onMap) {
      classString += "pin";
    } else {
      classString += "list";
    }

    return (
      <div className={classString} onClick={this.clickItem.bind(this)}>
        <div className="place__pic">
          <img src="http://www.luxuo.com/wp-content/uploads/2011/07/bangkok-temple.jpg" />
        </div>
        <div className="place__order">{item.i+1}</div>
        <div className="place__text">
          <div className="title">{item.title}</div>
          <div className="subtitle">{item.subtitle}</div>
        </div>
      </div>
    );
  }

  clickItem() {
    let props = this.props;

     MapActions.poiOpen({ index: props.item.i });
    // TODO: Swap to fix the map loading issue
    //MapActions.gotoPlace({ place: props.item.slug, placeTitle: props.item.title });
  }

}
