import React from "react";

/**
 * Alerts for the sidebar
 */
export default class AlertView extends React.Component {

  render() {
    let classString = "alert",
        message = "";

    if (this.props.error) {
      message = this.props.error.message;
      let type = this.props.error.type;
      classString += " active error" + type;
    }

    return (
      <div className={classString}>
        {message}
      </div>
    );
  }

}
