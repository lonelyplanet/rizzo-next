import React from "react";

/**
 * Shows when items are being fetched
 */
export default class SidebarFetchingView extends React.Component {

  render() {
    let location = this.props.location,
        breadcrumb = this.props.breadcrumb,
        crumbText =  breadcrumb || location.grandparent,
        placeText = this.props.place || location.title;

    let backElement = crumbText ? <div className="location-subtitle" ><i className="icon icon-chevron-left" aria-hidden="true"></i>{crumbText}</div> : "";

    return (
      <div className="sidebar fetching">
        <header className="sidebar__header">
          <div className="location-subtitle" >
            {backElement}
          </div>
          <h1 className="sidebar__title">
            {placeText}
          </h1>
          <div className="sidebar__tabs"></div>
        </header>
        <div className="panel">
          <div className='spinner'></div>
        </div>
      </div>
    );
  }

}
