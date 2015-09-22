import React from "react";
import MapActions from "../actions";

export default class SidebarDropdown extends React.Component {

  render() {
    let topicCount = 0;
    let classString = "tab__sub-nav";

    // <data>.map(function(<data>, i){});
    // {topicItems}
    let topicItems =  {

    }

    if (this.props.tabDropdownOpen) {
      classString += " tab__sub-nav--visible"
    }

    return (
      <div className={classString}>
        <ul className="tab__sub-nav__list">
          <li>topic 1</li>
          <li>topic 2</li>
          <li>topic 3</li>
        </ul>
      </div>
    )
  }
}



