import $ from "jquery";
import SearchServerActions from "./search_server_actions";

let SearchApi = {
  search: (query) => {
    let searchResults = null;
    let videoResults = null;

    $.ajax({
      url: `https://www.lonelyplanet.com/search.json?q=${query}`
    }).done((results) => {
      searchResults = results;
      if (videoResults) {
        SearchServerActions.fetched(sortResults(query, searchResults, videoResults));
      }
    });

    $.ajax({
      url: `http://localhost:3000/video/search.json?q=${query}`
    }).done((results) => {
      videoResults = results;
      if (searchResults) {
        SearchServerActions.fetched(sortResults(query, searchResults, videoResults));
      }
    });
  }
};

const sortResults = (query, searchResults, videoResults) => {
  let results = [];

  const bestVideoResults = videoResults.filter((v) => {
    return v.name.toLowerCase().startsWith(query.toLowerCase());
  });
  const bestVideoResultCount = bestVideoResults.length;

  // Remove best videos from original list to prevent duplicates
  videoResults = videoResults.filter((v) => {
    return bestVideoResults.findIndex((x) => x.name === v.name) === -1;
  });

  // Merge results by alternating between the best video results and the search results
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
    results.splice(2, 0, videoResults.shift());
  }

  // Add less relevant video results to the end
  results = results.concat(videoResults);

  return results;
};

export default SearchApi;
