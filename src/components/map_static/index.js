require("./_map_static.scss");

let mapLoaded = false;
let $mapButton = $(".js-open-map");
$mapButton.on("click", function() {
  if (!mapLoaded) {
    require([
      "../map/index"
    ], (MapComponent) => {
      let map = new MapComponent({
        el: ".map_holder"
      });
      map.open();
    });
  }
});

if (window.location.href.indexOf("/map") > -1) {
  $mapButton.trigger("click");
}
