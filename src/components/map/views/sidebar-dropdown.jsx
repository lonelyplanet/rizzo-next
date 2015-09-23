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
          <li className="tab__sub-nav__list--item"><span className="tab__sub-nav__list--text">See</span></li>
          <li className="tab__sub-nav__list--item"><span className="tab__sub-nav__list--text">Sleep</span></li>
          <li className="tab__sub-nav__list--item"><span className="tab__sub-nav__list--text">Eat</span></li>
        </ul>
      </div>
    )
  }
}



