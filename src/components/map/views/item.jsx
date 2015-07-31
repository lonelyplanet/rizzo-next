var React = require("react");
var MapActions = require("../actions");

var ItemView = React.createClass({

  render: function() {
    var item = this.props.item;
    var classString = "place ";
    if (item.onMap) {
      classString += "pin";
    } else {
      classString += "list";
    }
    return (
      <div className={classString} onClick={this.clickItem}>
        <div className="place__pic">
          <img src="http://www.luxuo.com/wp-content/uploads/2011/07/bangkok-temple.jpg" />
        </div>
        <div className="place__order">{item.i+1}</div>
        <div className="place__text">
          <div className="title">{item.title}</div>
          <div className="subtitle">{item.subtitle}</div>
        </div>
      </div>
    )
  },

  clickItem: function(e) {
    var props = this.props;
    console.log(props);
    // MapActions.poiOpen({ index: props.item.i });
    MapActions.gotoPlace({ place: props.item.slug, placeTitle: props.item.title });
  }

});

module.exports = ItemView;
