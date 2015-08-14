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
      placements: [
        {
          divName: "sponsored",
          networkId: 9807,
          siteId: 316543,
          adTypes: [ 43 ],
          eventIds: [31, 32],
          campaignId: 284161,
          properties: {
            "place": "asia"
          }
        },
        {
          divName: "sponsored1",
          networkId: 9807,
          siteId: 316543,
          adTypes: [ 43 ],
          eventIds: [31, 32],
          campaignId: 284161,
          properties: {
            "place": "asia"
          }
        }
      ]
    });
  $.ajax({
    url: "http://engine.adzerk.net/api/v2",
    method: "POST",
    contentType: "application/json",
    data: x,
    success: function(response) {
      let set = {title: "Sponsored", items: [] };
      for(let decision in response.decisions) {
        let poi = JSON.parse(response.decisions[decision].contents[0].body);
          set.items.push(poi);
      }
      Arkham.trigger("sponsor.fetched", set)
    },
    error: function() {
      console.log("fail")
    }
  });


  }

};

export default MapActions;
