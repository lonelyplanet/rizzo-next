var React = require("react");
var MapActions = require("../actions");

var TabView = React.createClass({

  render() {
    var title = this.props.name;
    var isActive = this.props.active ? "tab active" : "tab";
    return (
      <div className={isActive} onClick={this.tabClick}>
        {title}
      </div>
    )
  },

  tabClick() {
    var props = this.props;
    MapActions.viewChange({ view: props.i })
  }
});

module.exports = TabView;
