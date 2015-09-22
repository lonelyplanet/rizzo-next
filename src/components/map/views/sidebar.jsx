import React from "react";
import Tab from "./tab.jsx";
import Panel from "./panel.jsx";
import MapActions from "../actions";
import AboutPanel from "./about-panel.jsx";

/**
 * Sidebar view that sets up main tabs
 */
export default class SidebarView extends React.Component {

  render() {
    let location = this.props.location,
        activeSetIndex = this.props.activeSetIndex,
        panelContent,
        tabCount = 0,
        sets = this.props.sets,
        place = location.title,
        backSlug = "",
        backElement = "",
        h1Class = "sidebar__title __continent";

    let tabs = sets.map(function(set, i) {
      tabCount++;
      let isActive = i === activeSetIndex ? true : false;
      return (
        <Tab name={set.title} active={isActive} i={i} />
      )
    });

    if (location.description.length > 0) {
      tabCount++;
      let dropdownOpen = this.props.tabDropdownOpen
      let isActive = tabCount === activeSetIndex ? true : false;
      let aboutTab = <Tab name="About" active={isActive} i={tabCount} customPanel="about" tabDropdownOpen={dropdownOpen}/>
      tabs.push(aboutTab);
    }

    if (this.props.sets.length < 1) {
      panelContent =  <div className="no-content" dangerouslySetInnerHTML={{__html: location.description}}></div>;
    } else {
      if( this.props.customPanel === "about" ) {
        panelContent = <AboutPanel location={location} />;
      } else {
        let activePanel = sets[this.props.activeSetIndex];
        panelContent = <Panel highlightedPoi={this.props.highlightedPoi} set={activePanel} />;
      }
    }

    if (location.parent_slug && (location.parent_slug !== location.slug)) {
      backSlug = `/${location.parent_slug}`;
      backElement = <a href={backSlug} className="location-subtitle" onClick={this.parentClick.bind(this)}><i className="icon icon-chevron-left" aria-hidden="true"></i>{location.parent}</a>;
      h1Class = "sidebar__title";
    }

    return (
      <div className="sidebar">
        <header className="sidebar__header">
          {backElement}
          <h1 className={h1Class}>
            {location.title}
          </h1>
          <ul className="sidebar__tabs">
            {tabs}
          </ul>
        </header>
        {panelContent}
      </div>
    );
  }

  parentClick(e) {
    e.preventDefault();
    let props = this.props;
    MapActions.gotoPlace({ place: props.location.parent_slug, placeTitle: props.location.parent });
  }

}
