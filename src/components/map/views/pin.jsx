let React = require("react");
let MapActions = require("../actions");
let Item = require("./item.jsx");

let PinView = React.createClass({

  render: function() {
    let pin = this.props.pin;
    return (
      <Item item={pin} />
    )
  }

});

module.exports = PinView;
