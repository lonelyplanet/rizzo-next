import assign from "lodash/object/assign";
import Events from "../../core/mixins/events";
import { Arkham } from "../../core/bane";

let state = {
  currentIndex: 0,
  images: []
};

let MastheadState = {
  setInitialState: (initialState) => {
    if (!initialState.images) return;
    
    initialState.currentIndex = initialState.images.length;
    assign(state, initialState);
  },
  getState: () => {
    return state;
  }
};

Arkham.on("masthead.nextImage", () => {
  state.currentIndex--;

  if (state.currentIndex === 0) {
    MastheadState.trigger("preLooped", state);
  } else if (state.currentIndex < 0) {
    state.currentIndex = state.images.length - 1;
    MastheadState.trigger("looped", state);
  } else {
    MastheadState.trigger("changed", state);
  }
});

assign(MastheadState, Events);

export default MastheadState;
