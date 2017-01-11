import Arkham from "../../core/arkham";
import times from "lodash/times";
import assign from "lodash/assign";
import filter from "lodash/filter";
import each from "lodash/each";
import uniq from "lodash/uniq";
import MapApi from "./map_api";
import track from "../../core/decorators/track";

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

class MapActions {

  viewChange(data) {
    Arkham.trigger("view.changed", data);
  }
  @track("Map goToPlace")
  gotoPlace({ placeTitle, place, breadcrumb, topic="" }) {
    let query = topic ? `?topic=${topic.toLowerCase()}` : "",
        url = `/${place}/map.json${query}`;

    Arkham.trigger("place.fetching", { placeTitle, breadcrumb, topic });

    MapApi.fetch(url).done((results) => {
      Arkham.trigger("place.fetched", results);
    });

    return {
      category: "Destinations Next",
      label:    placeTitle
    };
  }

  poiOpen(data) {
    Arkham.trigger("poi.opened", data);
  }

  poiClose() {
    Arkham.trigger("poi.closed");
  }

  pinHover(data) {
    Arkham.trigger("map.poihover", data);
  }

  itemHighlight(data) {
    Arkham.trigger("item.hovered", data);
  }

  mapOpen() {
    Arkham.trigger("map.opened");
  }

  mapClose() {
    Arkham.trigger("map.closed");
  }

  setState(state) {
    Arkham.trigger("state.setinitial", state);
  }

  @track("Map Location Override")
  initMap() {
    Arkham.trigger("map.init");
    return { label: `/${window.lp.place.slug}/map`, category: "Page View" };
  }

  customPanel(data) {
    Arkham.trigger("custompanel.opened", data);
  }

  fetchSponsors() {
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
          Arkham.trigger("sponsor.fetched", set);
        }
      },
      error: function() {
        console.log("fail");
      }
    });
  }
}

export default new MapActions();
