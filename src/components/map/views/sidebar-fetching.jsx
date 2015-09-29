import React from "react";

/**
 * Shows when items are being fetched
 */
export default class SidebarFetchingView extends React.Component {

  render() {
    let poi = this.props.poi;

    return (
      <div className="sidebar fetching">
        <header className="sidebar__header">
          <div className="location-subtitle" ></div>
          <h1 className="sidebar__title">
            {this.props.place}
          </h1>
          <div className="sidebar__tabs"></div>
        </header>
        <div className='spinner'></div>
      </div>
    )
  }

}
