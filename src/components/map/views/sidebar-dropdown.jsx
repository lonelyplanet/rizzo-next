import React from "react";
import MapActions from "../actions";
import unique from "lodash/array/uniq";
import values from "lodash/object/values"
import flatten from "lodash/array/flatten"
import pluck from "lodash/collection/pluck"
import MapState from "../state";

export default class SidebarDropdown extends React.Component {
  constructor(data) {
    super(data)

    this.state = MapState.getState();
  }

  changeTopic(event) {
    let topic = $(event.currentTarget).data("item");

    MapActions.gotoPlace({
      place: this.state.currentLocation.slug,
      topic
    });
  }
  render() {
    let topicCount = 0,
        classString = "tab__sub-nav";

    let topics = this.state.topics.map((item) => {
      return (
        <li className="tab__sub-nav__list--item" data-item={item} onClick={this.changeTopic.bind(this)}><span className="tab__sub-nav__list--text">{item}</span></li>
      )
    });

    if (this.props.tabDropdownOpen) {
      classString += " tab__sub-nav--visible"
    }

    return (
      <div className={classString}>
        <ul className="tab__sub-nav__list">
          {topics}
        </ul>
      </div>
    )
  }
}



