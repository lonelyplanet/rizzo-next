import React from "react";
import Slideshow from "../../slideshow";
import $ from "jquery";

export default class AboutPanel extends React.Component {
  componentDidMount() {
    if (this.props.location.images.length) {
      this.slideshow = new Slideshow({
        el: this.refs.slideshow.getDOMNode(),
        type: "fade",
        images: this.props.location.images,
        height: 270,
        showProgress: true
      });
    } else {
      $(this.refs.slideshow.getDOMNode()).remove();
    }
  }
  render() {
    let place = this.props.location.title,
        description = this.props.location.description,
        // TODO Switch back to just ${this.props.location.slug} once this is live
        slug = `https://www.lonelyplanet.com/${this.props.location.slug}`;

    return (
      <div className="panel">
        <div className="slideshow js-panel-slideshow" ref="slideshow">
        </div>
        <header className="panel__header">Welcome to {place}</header>
        <div className="panel__content" dangerouslySetInnerHTML={{__html: description}}>
        </div>
        <footer className="panel__footer">
          <a className="panel__close" href={slug}>
            Close map and explore this destination
            <i className="icon-chevron-right" aria-hidden="true"></i>
          </a>
        </footer>
      </div>
    );
  }
}
