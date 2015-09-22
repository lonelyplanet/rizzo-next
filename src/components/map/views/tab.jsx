import React from "react";
import MapActions from "../actions";
import SidebarDropdown from "./sidebar-dropdown.jsx";

/**
 * Tabs for the sidebar view
 */
export default class TabView extends React.Component {

  render() {
    let title = this.props.name,
        sidebarDropdown = "",
        hideTimer,
        showTimer,
        isActive = this.props.active ? "tab active" : "tab";

    if (window.lp.place.type.toLowerCase() === "city") {
      sidebarDropdown = <SidebarDropdown tabDropdownOpen={this.props.tabDropdownOpen}/>
    }

    return (
      <li className={isActive} onClick={this.tabClick.bind(this)} onMouseEnter={this.showSubmenu.bind(this)} onMouseLeave={this.hideSubmenu.bind(this)} >
        {sidebarDropdown}
        {title}
      </li>
    );
  }

  tabClick() {
    let props = this.props;
    if (props.customPanel) {
      MapActions.customPanel({ panel: props.customPanel, view: props.i });
    } else {
      MapActions.viewChange({ view: props.i });
    }
  }

  showSubmenu() {
    if (this.props.name === "Experiences") {
      clearTimeout(this.hideTimer);

      this.showTimer = setTimeout(() => {
        MapActions.tabSubmenu({ openDropdown: true });
      }, 150);
    }
  }

  hideSubmenu() {
    clearTimeout(this.showTimer);

    this.hideTimer = setTimeout(() => {
      MapActions.tabSubmenu({ openDropdown: false });
    }, 500);
  }
}

module.exports = TabView;
