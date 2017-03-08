import React from "react";
import Sidebar from "./sidebar.jsx";
import SidebarFetching from "./sidebar-fetching.jsx";
import SidebarDetails from "./sidebar-details.jsx";
import Map from "./map.jsx";
import Alert from "./alert.jsx";
import MapState from "../state";
import MapActions from "../actions";

let getMapState = function() {
  return MapState.getState();
};

/**
 * Controls the sidebar views, and the map
 */
export default class MainView extends React.Component {
  constructor(props) {
    super(props);

    this.state = getMapState();
  }

  componentDidMount() {
    MapState.addChangeListener(this._onChange.bind(this));
  }

  componentWillUnmount() {
    MapState.removeChangeListener(this._onChange.bind(this));
  }

  _onChange() {
    this.setState(getMapState());
  }

  render() {
    let sidebar;
    let classString = "map";

    if (this.state.isOpen) {
      classString += " open";
    }

    if (this.state.isFetching) {
      sidebar = <SidebarFetching location={this.state.currentLocation} place={this.state.fetchingPlace} breadcrumb={this.state.placeParent} />;
    } else {
      if (this.state.isDetail) {
        sidebar = <SidebarDetails poi={this.state.poi} />;
      } else {
        sidebar = <Sidebar location={this.state.currentLocation} sets={this.state.sets} highlightedPoi={ this.state.hoveredItem } activeSetIndex={this.state.activeSetIndex} customPanel={this.state.customPanel} tabDropdownOpen={this.state.tabDropdownOpen}/>;
      }
    }

    let activeSet = this.state.sets[this.state.activeSetIndex];

    return (
      <div className={classString}>
        <div id="close-map--wrapper" onClick={this.closeMap}>
          <div className="close-map icon-close-small">Close</div>
        </div>
        <Map pins={activeSet} location={this.state.currentLocation} index={this.state.activeIndex} />
        {sidebar}
        <Alert error={this.state.error} />
      </div>
    );
  }

  // TODO: Trigger an action here, try not to call dispatcher directly
  closeMap() {
    MapActions.mapClose();
  }
}
