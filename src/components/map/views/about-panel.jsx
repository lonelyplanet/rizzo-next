import React from "react";
import Item from "./item.jsx";
import Slideshow from "../../slideshow";

export default class AboutPanel extends React.Component {
  componentDidMount() {
    this.slideshow = new Slideshow({
      el: this.refs.slideshow.getDOMNode(),
      type: "fade",
      images: this.props.location.images,
      height: 350
    });
  }
  render() {
    let description = this.props.location.description;
    
    return (
      <div className="about-panel">
        <div className="slideshow js-panel-slideshow" ref="slideshow">
        </div>
        <div className="panel" dangerouslySetInnerHTML={{__html: description}}>
        </div>
      </div>
    )
  }
}
