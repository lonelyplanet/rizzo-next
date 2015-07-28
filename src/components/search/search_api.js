import $ from "jquery";
import SearchServerActions from "./search_server_actions";

let SearchApi = {
  search: (query) => {
    $.ajax({
      url: `http://www.lonelyplanet.com/search.json?q=${query}`
    }).done((results) => {
      SearchServerActions.fetched(results);
    });
  }
};

export default SearchApi;
