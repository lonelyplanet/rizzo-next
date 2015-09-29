import React from "react";
import Tab from "./tab.jsx";

/**
 * Shows when items are being fetched
 */
export default class SidebarFetchingView extends React.Component {

  render() {
    let poi = this.props.poi,
        location = this.props.location,
        sets = this.props.sets,
        backElement = "",
        tabCount = 0;

    let tabs = sets.map((set, i) => {
      tabCount++;
      return (
        <Tab sets={sets} name={set.title} i={i} type={set.type} />
      )
    });

    if (location.description.length > 0) {
      tabCount++;
      let aboutTab = <Tab name="About" i={tabCount} customPanel="about" />
      tabs.push(aboutTab);
    }

    console.log(location);
    if (location.grandparent) {
      backElement = <div className="location-subtitle" ><i className="icon icon-chevron-left" aria-hidden="true"></i>{location.grandparent}</div>;
    }

    return (
      <div className="sidebar fetching">
        <header className="sidebar__header">
          <div className="location-subtitle" >
            {backElement}
          </div>
          <h1 className="sidebar__title">
            {this.props.place}
          </h1>
          <div className="sidebar__tabs">

          </div>
        </header>
        <div className='spinner'></div>
      </div>
    )
  }

}
