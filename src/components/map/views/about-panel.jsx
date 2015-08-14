import React from "react";
import Item from "./item.jsx";

export default class AboutPanel extends React.Component {

  render() {
    let description = this.props.location.description;
    return (
      <div className="panel" dangerouslySetInnerHTML={{__html: description}}>
      </div>
    )
  }
}
