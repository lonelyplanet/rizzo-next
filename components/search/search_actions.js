import { Arkham } from "../../core/bane";
import SearchApi from "./search_api";

let SearchActions = {
  openSearch: () => {
    Arkham.trigger("search.start");
  },
  endSearch: () => {
    Arkham.trigger("search.end");
  },
  typing: (data) => {
    Arkham.trigger("search.fetch", data);

    SearchApi.search(data.query);
  }
};

export default SearchActions;
