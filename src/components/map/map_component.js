import { Component } from "../../core/bane";
import React from "react";
import MainView from "./views/main.jsx";
import MapActions from "./actions";
import Arkham from "../../core/arkham"

class MapComponent extends Component {

  initialize(props) {
    let originalState = this.getInitialState();
    this.el = props.el;

    MapActions.setState(originalState.data);

    React.render(<MainView />, document.querySelector(this.el));

    Arkham.on("map.closed", () => {
      this.close();
    });

    // TODO: Uncomment to grab sponsored data
    // MapActions.fetchSponsors();
  }

  open() {
    this.$el.addClass("open");
    $("html,body").addClass("noscroll");
    MapActions.mapOpen();

    if (!/map\/?$/.test(window.location.pathname)) {
      let pathname = window.location.pathname;
      let lastChar = window.location.pathname.substr(-1); // Selects the last character
      
      if (lastChar !== "/") {         // If the last character is not a slash
         pathname = pathname + "/";   // Append a slash to it.
      }
    
      history.pushState({}, "", `${pathname}map/`);
    }
  }

  close() {
    $("html,body").removeClass("noscroll");
    this.$el.removeClass("open");

    let path = window.location.pathname.replace(/map\/?/, "");
    history.pushState({}, "", `${path}`);
  }

}

export default MapComponent;
