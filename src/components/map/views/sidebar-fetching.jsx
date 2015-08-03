let React = require("react");

let SidebarFetchingView = React.createClass({

  render: function() {
    return (
      <div className="sidebar fetching">
        <span>Fetching {this.props.place}</span>
        <br/>
        <div className='spinner'></div>
      </div>
    )
  }

});

module.exports = SidebarFetchingView;
