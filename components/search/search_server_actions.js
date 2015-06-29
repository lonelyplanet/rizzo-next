import { Arkham } from "../../core/bane";

let SearchServerActions = {
  fetched: (results) => {
    Arkham.trigger("search.fetched", {
      results: results
    });
  }
};

export default SearchServerActions;
