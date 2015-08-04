import React from "react";

/**
 * Shows when items are being fetched
 */
export default class SidebarFetchingView extends React.Component {

  render() {
    return (
      <div className="sidebar fetching">
        <span>Fetching {this.props.place}</span>
        <br/>
        <div className='spinner'></div>
      </div>
    )
  }

}
