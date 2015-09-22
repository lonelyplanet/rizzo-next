import assign from "lodash/object/assign";
import Arkham from "../../core/arkham";
import Events from "../../core/mixins/events";
// TODO: Pull in only delay method
import delay from "lodash/function/delay";
import find from "lodash/collection/find";

let _ = {
  find, delay
};

let CHANGE_EVENT = "change";

let state = {
  isOpen: false,
  isFetching: true,
  fetchingPlace: "",
  isDetail: false,
  activeSetIndex: 0,
  poi: 2,
  currentLocation: {},
  sets: [],
  error: null,
  hoveredPin: 0,
  hoveredItem: null,
  customPanel: "",
  tabDropdownOpen: false
};

let MapState = assign({

  getState() {
    return state;
  },

  emitChange() {
    this.trigger(CHANGE_EVENT);
  },

  addChangeListener(cb) {
    this.on(CHANGE_EVENT, cb);
  },

  removeChangeListener(cb) {
    this.stopListening(CHANGE_EVENT, cb);
  },

  sortSets: (sets) => {
    let headings = ["experiences", "countries", "cities", "sponsored", "about"];

    return headings.reduce((memo, heading) => {
      let set = find(sets, (set) => set.title.toLowerCase() === heading);
      if (set) {
        memo.push(set);
      }

      return memo;
    }, []);
  }
}, Events);

Arkham.on("map.opened", () => {
  state.isOpen = true;
  MapState.emitChange();
});

Arkham.on("map.closed", () => {
  state.isOpen = false;
  MapState.emitChange();
});

Arkham.on("view.changed", (data) => {
  state.hoveredItem = data;
  state.activeSetIndex = data.view;
  state.customPanel = "";
  MapState.emitChange();
});

Arkham.on("poi.opened", (data) => {
  state.poiIndex = parseInt(data.index, 10);
  state.poi = data.poi;
  state.isDetail = true;
  MapState.emitChange();
});

Arkham.on("poi.closed", () => {
  state.poi = null;
  state.isDetail = false;
  MapState.emitChange();
});

Arkham.on("place.fetching", (data) => {
  state.isFetching = true;
  state.fetchingPlace = data.placeTitle;
  MapState.emitChange();
});

Arkham.on("place.fetched", (data) => {
  state.currentLocation = data.location;
  state.sets = MapState.sortSets(data.sets.filter((s) => !!s.items.length));
  state.activeSetIndex = 0;
  state.fetchingPlace = "";
  state.isFetching = false;
  state.customPanel = "";
  MapState.emitChange();
});

Arkham.on("place.errorfetching", (data) => {
  state.isFetching = false;
  state.fetchingPlace = "";
  state.error = data;
  MapState.emitChange();
  _.delay(function() {
    state.error = null;
    MapState.emitChange();
  }, 3000);
});

Arkham.on("state.setinitial", (data) => {
  state.isFetching = false;
  state.sets = MapState.sortSets(data.sets.filter((s) => !!s.items.length));
  state.currentLocation = data.location;
  MapState.emitChange();
});

Arkham.on("poi.hover", (data) => {
  state.hoveredPin = data.pin;
  MapState.emitChange();
});

Arkham.on("item.hovered", (data) => {
  state.hoveredItem = data;
  MapState.emitChange();
});

Arkham.on("custompanel.opened", (data) => {
  state.lastActiveSetIndex = state.activeSetIndex;
  state.activeSetIndex = data.view;
  state.customPanel = data.panel;
  MapState.emitChange();
});

Arkham.on("sponsor.fetched", (data) => {
  state.sets.push(data);
  MapState.emitChange();
});

Arkham.on("tabsubmenu.hovered", (data) => {
  state.tabDropdownOpen = data.openDropdown;
  MapState.emitChange();
});

export default MapState;
