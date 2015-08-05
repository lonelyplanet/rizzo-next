import React from "react";
import MapActions from "../actions";

/**
 * Tabs for the sidebar view
 */
export default class TabView extends React.Component {

  render() {
    let title = this.props.name;
    let isActive = this.props.active ? "tab active" : "tab";
    return (
      <div className={isActive} onClick={this.tabClick}>
        {title}
      </div>
    )
  }

  tabClick() {
    let props = this.props;
    MapActions.viewChange({ view: props.i })
  }
}

module.exports = TabView;
