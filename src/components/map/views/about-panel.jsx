import React from "react";
import Slideshow from "../../slideshow";
import $ from "jquery";

export default class AboutPanel extends React.Component {
  componentDidMount() {
    if (this.props.location.images.length) {
      this.slideshow = new Slideshow({
        el: this.$slideshow,
        type: "fade",
        images: this.props.location.images,
        height: 270,
        showProgress: true
      });
    }

    this.$slideshow.remove();
  }
  render() {
    const place = this.props.location.title;
    const description = this.props.location.description;

    return (
      <div className="panel">
        <div className="slideshow js-panel-slideshow" ref={(node) => this.$slideshow = $(node)}>
        </div>
        <header className="panel__header">Welcome to {place}</header>
        <div className="panel__content" dangerouslySetInnerHTML={{__html: description}}>
        </div>
      </div>
    );
  }
}
