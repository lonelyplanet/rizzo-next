import deburr from "lodash/deburr";
/**
 * Takes a given string and turns it into a hyphenated slug
 * @param  {String} string String to replace
 * @return {String}
 */
const clean = string => {
  // allow only basic latin alpha, numeric, / - _ and whitespace
  return deburr(string).replace(/[^/-\w\s]/gi, "");
};

let slugify = string => {
  if (!string || typeof string !== "string") return "";

  return clean(string)
    .toLowerCase()
    .replace(/\s/g, "-");
};

export { slugify };
