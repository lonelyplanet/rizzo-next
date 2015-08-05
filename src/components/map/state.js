import assign from "lodash/object/assign";
import Arkham from "../../core/arkham";
import Events from "../../core/mixins/events";
// TODO: Pull in only delay method
import _ from "lodash";
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
  hoveredPin: 0
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
  state.activeSetIndex = data.view;
  MapState.emitChange();
});

Arkham.on("poi.opened", (data) => {
  state.poi = parseInt(data.index, 10);
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
  state.sets = data.sets;
  state.activeSetIndex = 0;
  state.fetchingPlace = "";
  state.isFetching = false;
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
  state.sets = data.sets;
  state.currentLocation = data.location;
  MapState.emitChange();
});

Arkham.on("poi.hover", (data) => {
  state.hoveredPin = data.pin;
  MapState.emitChange();
});

export default MapState;
