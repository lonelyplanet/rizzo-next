import assign from "../../node_modules/lodash/object/assign";
import Events from "../../core/mixins/events";
import { Arkham } from "../../core/bane";

let state = {
  destinations: {
    caption: "",
    articles: []
  }
};

let StackState = {
  setInitialState: (initialState) => {
    assign(state.destinations, initialState);
  },
  getState: () => {
    return state;
  }
};

assign(StackState, Events);

Arkham.on("stacks.fetched", function(data) {
  state.destinations.articles = state.destinations.articles.concat(data.stacks);

  StackState.trigger("changed", state);
});

export default StackState;
