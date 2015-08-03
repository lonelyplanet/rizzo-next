let React = require("react");
let Tab = require("./tab.jsx");
let Panel = require("./panel.jsx");

let MapActions = require("../actions");

let SidebarView = React.createClass({

  render: function() {
    let location = this.props.location;
    let activeSetIndex = this.props.activeSetIndex;
    let panelContent;
    let tabCount = 0;
    let tabs = this.props.sets.map(function(set, i) {
      tabCount++;
      let isActive = i === activeSetIndex ? true : false;
      return (
        <Tab name={set.title} active={isActive} i={i} />
      )
    });

    if (location.description.length > 0) {
      tabCount++;
      let isActive = tabCount === activeSetIndex ? true : false;
      let aboutTab = <Tab name="About" active={isActive} i={tabCount} />
      tabs.push(aboutTab);
    }

    if (this.props.sets.length < 1) {
      panelContent =  <div className="no-content" dangerouslySetInnerHTML={{__html: location.description}}></div>;
    } else {
      let activePanel = this.props.sets[this.props.activeSetIndex];
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
    let props = this.props;
    MapActions.gotoPlace({ place: props.location.parent_slug, placeTitle: props.location.parent })
  }

});

module.exports = SidebarView;
