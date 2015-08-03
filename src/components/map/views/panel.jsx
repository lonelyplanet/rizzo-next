let React = require("react");
let Item = require("./item.jsx");

let PanelView = React.createClass({

  render: function() {
    let items = this.props.set.items.map(function(item, i) {
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
