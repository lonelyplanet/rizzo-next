"use strict";

let Handlebars = require("handlebars");

module.exports = {
  compile() {
    return Handlebars.compile.apply(Handlebars, arguments);
  }
};
