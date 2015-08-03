let React = require("react");
let MapActions = require("../actions");

let TabView = React.createClass({

  render() {
    let title = this.props.name;
    let isActive = this.props.active ? "tab active" : "tab";
    return (
      <div className={isActive} onClick={this.tabClick}>
        {title}
      </div>
    )
  },

  tabClick() {
    let props = this.props;
    MapActions.viewChange({ view: props.i })
  }
});

module.exports = TabView;
