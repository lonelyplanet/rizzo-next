var React = require("react");

var Sidebar =         require("./sidebar.jsx");
var SidebarFetching = require("./sidebar-fetching.jsx");
var SidebarDetails =  require("./sidebar-details.jsx");
var Map =             require("./map.jsx");
var Alert =           require("./alert.jsx");
var MapState =        require("../state");

var getMapState = function(props) {
  return MapState.getState();
};

var MainView = React.createClass({

  getInitialState: function() {
    return getMapState();
  },

  componentDidMount: function() {
    MapState.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    MapState.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(getMapState());
  },

  render: function() {
    console.log(this);
    var sidebar;
    var classString = "map";
    var alert;

    if (this.state.isOpen) {
      classString += " open";
    }

    if (this.state.isFetching) {
      sidebar = <SidebarFetching place={this.state.fetchingPlace} />;
    } else {
      if (this.state.isDetail) {
        sidebar = <SidebarDetails poi={this.state.sets[this.state.activeSetIndex].items[this.state.poi]} />
      } else {
        sidebar = <Sidebar location={this.state.currentLocation} sets={this.state.sets} activeSetIndex={this.state.activeSetIndex} />
      }
    }

    var activeSet = this.state.sets[this.state.activeSetIndex];

    return (
      <div className={classString}>
        <div className="close-map" onClick={this.closeMap}>Close</div>
        <Map pins={activeSet} location={this.state.location} index={this.state.activeIndex} />
        {sidebar}
        <Alert error={this.state.error} />
      </div>
    )
  },

  closeMap() {
    Arkham.trigger("map.closed");
  }

});

module.exports = MainView;
