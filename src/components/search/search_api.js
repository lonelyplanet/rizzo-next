import $ from "jquery";
import SearchServerActions from "./search_server_actions";

const mergeResults = (query, searchResults, videoResults) => {

  // Best video results are videos whose name starts with the query text.
  // They'll be listed first in the results.
  let bestVideoResults = [];
  if (query.length > 1) {
    bestVideoResults = videoResults.filter((v) => {
      return v.name.toLowerCase().startsWith(query.toLowerCase());
    });
    const bestVideoResultIds = bestVideoResults.map(v => v.id);
    videoResults = videoResults.filter(v => !bestVideoResultIds.includes(v.id));
  }

  const bestVideoResultCount = bestVideoResults.length;

  let results = [];

  // If we are under the '/video' path, always list video results first
  if (window.location.pathname.toLowerCase().startsWith("/video")) {
    results = bestVideoResults.concat(videoResults);
    bestVideoResults = [];
    videoResults = [];
  }

  // Merge results by alternating between them
  while (bestVideoResults.length || searchResults.length) {
    if (bestVideoResults.length) {
      results.push(bestVideoResults.shift());
    }
    if (searchResults.length) {
      results.push(searchResults.shift());
    }
  }

  // Make sure at least 1 video result appears in the top 5
  if (!bestVideoResultCount && videoResults.length) {
    results.splice(4, 0, videoResults.shift());
  }

  return results;
};

let SearchApi = {
  search: (query) => {
    let searchResults = null;
    let videoResults = null;

    $.ajax({
      url: `https://www.lonelyplanet.com/search.json?q=${query}`
    }).done((results) => {
      searchResults = results;
      if (videoResults) {
        SearchServerActions.fetched(mergeResults(query, searchResults, videoResults));
      }
    });

    $.ajax({
      url: `https://www.lonelyplanet.com/video/search.json?q=${query}`
    }).done((results) => {
      videoResults = results;
      if (searchResults) {
        SearchServerActions.fetched(mergeResults(query, searchResults, videoResults));
      }
    });
  }
};


export default SearchApi;
