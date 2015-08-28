import React from "react";
import Tab from "./tab.jsx";
import Panel from "./panel.jsx";
import MapActions from "../actions";
import AboutPanel from "./about-panel.jsx"

/**
 * Sidebar view that sets up main tabs
 */
export default class SidebarView extends React.Component {

  render() {
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
      let aboutTab = <Tab name="About" active={isActive} i={tabCount} customPanel="about" />
      tabs.push(aboutTab);
    }

    if (this.props.sets.length < 1) {
      panelContent =  <div className="no-content" dangerouslySetInnerHTML={{__html: location.description}}></div>;
    } else {
      if( this.props.customPanel === "about" ) {
        panelContent = <AboutPanel location={location} />;
      } else {
        let activePanel = this.props.sets[this.props.activeSetIndex];
        panelContent = <Panel set={activePanel} />;
      }
    }
    let backSlug = `/${location.parent_slug}`;
    return (
      <div className="sidebar">
        <header className="sidebar-header">
          <h1>
            {location.title}
          </h1>
          <a href={backSlug} className="location-subtitle" onClick={this.parentClick.bind(this)}>&lt; Back to {location.parent}</a>
          <ul className="tabs">
            {tabs}
          </ul>
        </header>
        {panelContent}
      </div>
    )
  }

  parentClick(e) {
    e.preventDefault();
    let props = this.props;
    MapActions.gotoPlace({ place: props.location.parent_slug, placeTitle: props.location.parent })
  }

}
