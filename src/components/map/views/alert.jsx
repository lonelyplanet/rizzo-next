let React = require("react");

let AlertView = React.createClass({

  render: function() {
    let classString = "alert";

    if (this.props.error) {
      let message = this.props.error.message;
      let type = this.props.error.type;
      classString += " active error" + type;
    }

    return (
      <div className={classString}>
        {message}
      </div>
    );
  }

});

module.exports = AlertView;
