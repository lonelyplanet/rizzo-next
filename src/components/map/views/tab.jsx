import React from "react";
import MapActions from "../actions";
import SidebarDropdown from "./sidebar-dropdown.jsx";

/**
 * Tabs for the sidebar view
 */
export default class TabView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let title = this.props.name,
        sets = this.props.sets,
        hideTimer,
        showTimer,
        sidebarDropdown = "",
        isActive = this.props.active ? "tab active" : "tab";

    if (this.props.showDropdown) {
      sidebarDropdown = <SidebarDropdown sets={sets} tabDropdownOpen={this.state.openDropdown}/>
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
    if (this.props.type === "experiences") {
      clearTimeout(this.hideTimer);

      this.showTimer = setTimeout(() => {
        this.setState({ openDropdown: true });
      }, 150);
    }
  }

  hideSubmenu() {
    clearTimeout(this.showTimer);

    this.hideTimer = setTimeout(() => {
      this.setState({ openDropdown: false });
    }, 500);
  }
}

module.exports = TabView;
