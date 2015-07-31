var React = require("react");
var Tab = require("./tab.jsx");
var Panel = require("./panel.jsx");

var MapActions = require("../actions");

var SidebarView = React.createClass({

  render: function() {
    var location = this.props.location;
    var activeSetIndex = this.props.activeSetIndex;
    var panelContent;
    var tabCount = 0;
    var tabs = this.props.sets.map(function(set, i) {
      tabCount++;
      var isActive = i === activeSetIndex ? true : false;
      return (
        <Tab name={set.title} active={isActive} i={i} />
      )
    });

    if (location.description.length > 0) {
      tabCount++;
      var isActive = tabCount === activeSetIndex ? true : false;
      var aboutTab = <Tab name="About" active={isActive} i={tabCount} />
      tabs.push(aboutTab);
    }

    if (this.props.sets.length < 1) {
      panelContent =  <div className="no-content" dangerouslySetInnerHTML={{__html: location.description}}></div>;
    } else {
      var activePanel = this.props.sets[this.props.activeSetIndex];
      panelContent = <Panel set={activePanel} />;
    }

    return (
      <div className="sidebar">
        <header className="sidebar-header">
          <h1>
            {location.title}
          </h1>
          <a href={location.parent_slug} className="location-subtitle" onClick={this.parentClick}>&lt; Back to {location.parent}</a>
          <ul className="tabs">
            {tabs}
          </ul>
        </header>
        {panelContent}
      </div>
    )
  },

  parentClick(e) {
    e.preventDefault();
    var props = this.props;
    MapActions.gotoPlace({ place: props.location.parent_slug, placeTitle: props.location.parent })
  }

});

module.exports = SidebarView;
