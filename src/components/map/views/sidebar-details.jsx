var React = require("react");
var MapActions = require("../actions");

var SidebarDetailsView = React.createClass({

  render: function() {
    var poi = this.props.poi;

    return (
      <div className="sidebar details">
        <header className="sidebar-header">
          <h1>
            {poi.title}
          </h1>
          <a href={poi.slug} className="lp-link">Go to POI page on LP</a>
          <a href="#" className="close-poi" onClick={this.closePOI}>&lt; Go Back</a>
        </header>
        <div className="panel">
          <div className="poi-body" dangerouslySetInnerHTML={{__html: poi.description}}></div>
        </div>
      </div>
    )
  },

  closePOI: function(e) {
    e.preventDefault();
    MapActions.poiClose();
  }

});

module.exports = SidebarDetailsView;
