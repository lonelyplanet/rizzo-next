import React from "react";
import MapActions from "../actions";
import MapState from "../state";
import titles from "../tab_titles";

export default class SidebarDropdown extends React.Component {
  constructor(data) {
    super(data);

    this.state = MapState.getState();
  }

  componentDidMount() {
    if( !$(".is-selected").length )
      $(".tab__sub-nav__list--item:first-child").addClass("is-selected");
  }

  changeTopic(event) {
    let topic = $(event.currentTarget).data("item");
    $(".tab__sub-nav__list--item").removeClass("is-selected");

    MapActions.gotoPlace({
      place: this.state.currentLocation.slug,
      topic,
      breadcrumb: this.state.currentLocation.parent
    });
  }

  render() {
    let menuClassString = "tab__sub-nav";

    let topics = this.state.topics.map((item) => {
      let itemClassString = "tab__sub-nav__list--item";
      
      if (this.state.topicClicked === item) {
        itemClassString += " is-selected";
      }

      let title = titles[item.toLowerCase()] || item;  

      return (
        <li className={itemClassString} data-item={item} onClick={this.changeTopic.bind(this)}>{title}</li>
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
