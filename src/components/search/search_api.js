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
        SearchServerActions.fetched(mergeResults(query, searchResults, videoResults));
      }
    });

    $.ajax({
      url: `http://localhost:3000/video/search.json?q=${query}`
    }).done((results) => {
      videoResults = results;
      if (searchResults) {
        SearchServerActions.fetched(mergeResults(query, searchResults, videoResults));
      }
    });
  }
};

const mergeResults = (query, searchResults, videoResults) => {
  let results = [];

  let bestVideoResults = [];

  // Best video results are results that start with the search query
  if (query.length > 1) {
    bestVideoResults = videoResults.filter((v) => {
      return v.name.toLowerCase().startsWith(query.toLowerCase());
    });
  }

  // Second best video results are results where one word within the
  // video name starts with the search query
  videoResults = videoResults.filter((v) => {
    return (
      (bestVideoResults.findIndex((x) => x.name === v.name) === -1) &&
      (query.indexOf(" ") === -1 && !!(v.name.toLowerCase().split(" ").find((word) => word.startsWith(query.toLowerCase()))))
      );
  });

  const bestVideoResultCount = bestVideoResults.length;

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
    results.splice(4, 0, videoResults.shift());
  }

  // Add less relevant video results to the end
  results = results.concat(videoResults);

  return results;
};

export default SearchApi;
