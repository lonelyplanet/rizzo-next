import React from "react";
import Item from "./item.jsx";

/**
 * The side panel view
 */
export default class PanelView extends React.Component {

  render() {
    let items = this.props.set.items.map((item, i) => {
      item.i = i;
      item.onMap = false;
      return (
        <Item item={item}/>
      )
    });

    return (
      <div className="panel">
        <div className="listing">
          {items}
        </div>
      </div>
    )
  }

}
