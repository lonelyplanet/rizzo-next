/**
 * Takes a given string and turns it into a hyphenated slug
 * @param  {String} string String to replace
 * @return {String}
 */
let slugify = (string) => {
  if (!string || typeof string !== "string") return "";

  return string.toLowerCase().replace(/\s/g, "-");
};

export {
  slugify
};
