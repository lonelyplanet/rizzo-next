require("./_map_static.scss");

let mapLoaded = false;
let $mapButton = $(".js-open-map");
$mapButton.on("click", function() {
  if (!mapLoaded) {
    require.ensure([
      "../map/index"
    ], (require) => {
      let MapComponent = require("../map/index");
      
      let map = new MapComponent({
        el: ".map_holder"
      });
      
      map.open();
    }, "map");
  }
});

if (window.location.href.indexOf("/map") > -1) {
  $mapButton.trigger("click");
}
