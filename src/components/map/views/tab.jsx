import React from "react";
import MapActions from "../actions";
import SidebarDropdown from "./sidebar-dropdown.jsx";
import titles from "../tab_titles";

/**
 * Tabs for the sidebar view
 */
export default class TabView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let title = titles[this.props.name.toLowerCase()] || this.props.name,
        sidebarDropdown = "",
        isActive = this.props.active ? "tab active" : "tab",
        classString = `${isActive}`,
        iconAfter = "";

    if (this.props.showDropdown) {
      classString += " experiences"
      sidebarDropdown = <SidebarDropdown tabDropdownOpen={this.state.openDropdown}/>
      iconAfter = "tab__icon icon--chevron-down icon--white";
    }

    return (
      <li className={classString} onClick={this.tabClick.bind(this)} onMouseEnter={this.showSubmenu.bind(this)} onMouseLeave={this.hideSubmenu.bind(this)}>
        {title}
        <i className={iconAfter} aria-hidden="true"></i>
        {sidebarDropdown}
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
    clearTimeout(this.hideTimer);

    this.showTimer = setTimeout(() => {
      this.setState({ openDropdown: true });
    }, 0);
  }

  hideSubmenu() {
    clearTimeout(this.showTimer);

    this.hideTimer = setTimeout(() => {
      this.setState({ openDropdown: false });
    }, 250);
  }
}

module.exports = TabView;
