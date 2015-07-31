var React = require("react");

var AlertView = React.createClass({

  render: function() {
    var classString = "alert";
    if (this.props.error) {
      var message = this.props.error.message;
      var type = this.props.error.type;
      classString += " active error" + type;
    }

    return (
      <div className={classString}>
        {message}
      </div>
    )
  }

});

module.exports = AlertView;
