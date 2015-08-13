require("./_map_static.scss");

let mapLoaded = false;
$(".js-open-map").on("click", function() {
  if (!mapLoaded) {
    require([
      "../map/map_component"
    ], (MapComponent) => {
      let map = new MapComponent({
        el: ".map_holder"
      });
      map.open();
    });
  }
});
