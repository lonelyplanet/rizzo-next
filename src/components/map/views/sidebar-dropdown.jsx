import React from "react";
import MapActions from "../actions";
import unique from "lodash/array/uniq";
import values from "lodash/object/values"
import flatten from "lodash/array/flatten"
import pluck from "lodash/collection/pluck"
import MapState from "../state";

export default class SidebarDropdown extends React.Component {
  constructor(data) {
    super(data);

    this.state = MapState.getState();
  }

  changeTopic(event) {
    let topic = $(event.currentTarget).data("item");

    MapActions.gotoPlace({
      place: this.state.currentLocation.slug,
      topic,
      breadcrumb: this.state.currentLocation.parent
    });
  }
  render() {
    let topicCount = 0,
        menuClassString = "tab__sub-nav";

    let topics = this.state.topics.map((item) => {
      let itemClassString = "tab__sub-nav__list--item";
      if (this.state.topicClicked === item) {
        itemClassString += " is-selected";
      }

      return (
        <li className={itemClassString} data-item={item} onClick={this.changeTopic.bind(this)}>{item}</li>
      );
    });

    if (this.props.tabDropdownOpen) {
      menuClassString += " is-visible";
    }

    return (
      <div className={menuClassString}>
        <ul className="tab__sub-nav__list">
          {topics}
        </ul>
      </div>
    );
  }
}
