import React from "react";
import MapActions from "../actions";
import Item from "./item.jsx";

export default class PinView extends React.Component {

  render() {
    let pin = this.props.pin;
    pin.onMap = true;
    return (
      <Item item={pin} />
    );
  }

}
