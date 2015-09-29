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

  gotoPlace: ({ placeTitle, place, topic="" }) => {
    let query = topic ? `?topic=${topic.toLowerCase()}` : "",
        url = `/${place}/map.json${query}`;

    Arkham.trigger("place.fetching", { placeTitle });

    // TODO: JC, maybe this is cool, maybe not?
    // let mapData = window.localStorage.getItem(url);

    // if (mapData) {
    //   return Arkham.trigger("place.fetched", JSON.parse(mapData));
    // }

    $.ajax({
      url: url
    }).done((results) => {
      // window.localStorage.setItem(url, JSON.stringify(results));
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
    Arkham.trigger("map.poihover", data);
  },

  itemHighlight: (data) => {
    Arkham.trigger("item.hovered", data);
  },

  mapOpen: () => {
    Arkham.trigger("map.opened");
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
