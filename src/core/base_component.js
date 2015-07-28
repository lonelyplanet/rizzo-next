var Bane = require("./bane"),
    Handlebars = require("handlebars");

var BaseComponent = Bane.Component.extend({
  initialize: function() {
    var html = document.getElementById(this.templateName.replace(/\//g, "_")).textContent.trim();

    this.template = Handlebars.default.compile(html);
  }
});

module.exports = BaseComponent;