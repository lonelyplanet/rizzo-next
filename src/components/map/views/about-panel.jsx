import React from "react";
import Item from "./item.jsx";
import Slideshow from "../../slideshow";

export default class AboutPanel extends React.Component {
  componentDidMount() {
    this.slideshow = new Slideshow({
      el: this.refs.slideshow.getDOMNode(),
      type: "fade",
      images: this.props.location.images,
      height: 300
    });
  }
  render() {
    let description = this.props.location.description;
    let slug = `/${this.props.location.slug}`;

    return (
      <div className="about-panel">
        <div className="panel">
          <div className="slideshow js-panel-slideshow" ref="slideshow">
          </div>
          <div className="panel__content" dangerouslySetInnerHTML={{__html: description}}>
          </div>
          <div className="panel__footer">
            <a className="panel__close" href={slug}>
              Close map and explore {this.props.location.title}
              <span className="icon-chevron-right"></span>
            </a>
          </div>
        </div>
      </div>
    )
  }
}
