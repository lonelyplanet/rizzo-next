var React = require("react");
var Item = require("./item.jsx");

var PanelView = React.createClass({

  render: function() {
    var description = this.props.location.description;
    return (
      <div className="panel" dangerouslySetInnerHTML={{__html: description}}>
      </div>
    )
  }

});

module.exports = PanelView;
