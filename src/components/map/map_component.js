import { Component } from "../../core/bane";
var React = require("react");
var MainView = require("./views/main.jsx");
var MapActions = require("./actions");
var InteractiveMap = require("./interactive-map");
var MapState = require("./state");

class MapComponent extends Component {

  initialize(props) {
    let originalState = this.getInitialState();
    console.log(originalState);
    this.el = props.el;
    MapActions.setState(originalState.data);
    React.render(<MainView />, document.querySelector(this.el));
    new InteractiveMap({
      el: this.el
    });
    MapActions.initMap();
  }

  open() {
    this.$el.addClass("open");
    $("html,body").addClass("noscroll");
    MapActions.mapOpen();
  }

  close() {
    $("html,body").removeClass("noscroll");
    this.$el.removeClass("open");
    MapActions.close();
  }

}

export default MapComponent;
