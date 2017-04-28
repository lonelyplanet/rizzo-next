import assign from "lodash/assign";
import Arkham from "../../core/arkham";
import Events from "../../core/mixins/events";

let state = {
  isActive: false,
  isTyping: false,
  isFocused: false,
  results: [],
  query: ""
};

let SearchState = {};

// Mixin Pattern
// merge { } with { on, off, trigger }
// SearchState.on, SearchState.off, SearchState.trigger etc.....
assign(SearchState, Events);

//Arkham.on('overlay:click', () => {
//  state.isActive = false;
//
//  SearchState.trigger("change:isActive", state);
//});

Arkham.on("search.start", () => {
  state.isActive = true;

  SearchState.trigger("change:isActive", state);
});

Arkham.on("search.start", () => {
  state.isFocused = true;

  SearchState.trigger("change:isFocused", state);
});

Arkham.on("search.end overlay:click", () => {
  state.isActive = false;
  state.results = [];

  SearchState.trigger("change:isActive", state);
});

Arkham.on("search.fetch", (data) => {
  state.isTyping = true;
  state.query = data.query;

  SearchState.trigger("change:isTyping", state);
});

Arkham.on("search.fetched", (data) => {
  state.results = data.results.slice(0, 5);
  state.isTyping = false;

  SearchState.trigger("change:results", state);
});

export default SearchState;
