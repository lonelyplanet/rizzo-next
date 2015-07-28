import Arkham from "../../core/arkham";

let SearchServerActions = {
  fetched: (results) => {
    Arkham.trigger("search.fetched", {
      results: results
    });
  }
};

export default SearchServerActions;
