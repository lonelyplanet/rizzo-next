var React = require("react");
var MapActions = require("../actions");
var Item = require("./item.jsx");

var PinView = React.createClass({

  render: function() {
    var pin = this.props.pin;
    return (
      <Item item={pin} />
    )
  }

});

module.exports = PinView;
