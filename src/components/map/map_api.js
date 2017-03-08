import $ from "jquery";

export default {
  fetch: (url) => {
    return $.ajax({
      url: url
    });
  }
};
