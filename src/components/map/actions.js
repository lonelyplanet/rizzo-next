import Arkham from "../../core/arkham";

let MapActions = {

  viewChange: (data) => {
    Arkham.trigger("view.changed", data);
  },

  gotoPlace: (data) => {
    let place = data.place;
    Arkham.trigger("place.fetching", data);
    $.ajax({
      url: "/" + place + "/map.json"
    }).done((results) => {
      Arkham.trigger("place.fetched", results);
    }).error((results) => {
      let error = {
        message: "There was an error fetching " + data.placeTitled,
        type: results.status
      };
      Arkham.trigger("place.errorfetching", error);
    });
  },

  poiOpen: (data) => {
    Arkham.trigger("poi.opened", data);
  },

  poiClose: () => {
    Arkham.trigger("poi.closed");
  },

  pinHover: (data) => {
    Arkham.trigger("poi.hovered", data);
  },

  mapOpen: () => {
    Arkham.trigger("map.opened");
    // MapActions.gotoPlace({ place: "asia", placeTitle: "Asia" });
  },

  mapClose: () => {
    Arkham.trigger("map.closed");
  },

  setState: (state) => {
    Arkham.trigger("state.setinitial", state);
  },

  initMap: () => {
    Arkham.trigger("map.init");
  }

};

export default MapActions;
