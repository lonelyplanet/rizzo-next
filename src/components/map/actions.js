import Arkham from "../../core/arkham";
import times from "lodash/utility/times";
import assign from "lodash/object/assign";
import filter from "lodash/collection/filter";
import each from "lodash/collection/each";
import uniq from "lodash/array/uniq";

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
      Arkham.trigger("place.fetched", results.map_data);
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
  },

  customPanel: (data) => {
    Arkham.trigger("custompanel.opened", data);
  },

  fetchSponsors: (data) => {
    let x = JSON.stringify({
      placements: generatePlacements()
    }); 

    $.ajax({
      url: "http://engine.adzerk.net/api/v2",
      method: "POST",
      contentType: "application/json",
      data: x,
      success: function(response) {
        let set = { title: "Sponsored", items: [] },
            decisions = uniq(filter(response.decisions, d => d), "creativeId");

        each(decisions, decision => {
          let poi = JSON.parse(decision.contents[0].body);
              set.items.push(poi);
        });
        
        if (set.items.length) {
          Arkham.trigger("sponsor.fetched", set)  
        }
      },
      error: function() {
        console.log("fail")
      }
    });
  }

};

const generatePlacements = () => {
  let placement = {
    divName: "sponsored",
    networkId: 9807,
    siteId: 316543,
    adTypes: [ 43 ],
    eventIds: [31, 32],
    properties: {
      "place": window.lp.place.name.toLowerCase()
    }
  };

  const placements = [];

  times(20, (i) => {
    placements.push(assign({}, placement, {
      divName: `sponsored${i + 1}`
    }));
  });

  return placements;
};

export default MapActions;
