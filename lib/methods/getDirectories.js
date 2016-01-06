"use strict";

let fs = require("fs"),
    path = require("path");

module.exports = function getDirectories(src) {
  return fs.readdirSync(src).filter(function(file) {
    return fs.statSync(path.join(src, file)).isDirectory();
  });
};
