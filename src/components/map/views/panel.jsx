var React = require("react");
var Item = require("./item.jsx");

var PanelView = React.createClass({

  render: function() {
    var items = this.props.set.items.map(function(item, i) {
      item.i = i;
      return (
        <Item item={item}/>
      )
    });
    return (
      <div className="panel">
        <div className="listing">
          {items}
        </div>
      </div>
    )
  }

});

module.exports = PanelView;
