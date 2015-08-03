let Bane = require("./bane"),
    Handlebars = require("handlebars");

let BaseComponent = Bane.Component.extend({
  initialize: function() {
    let html = document.getElementById(this.templateName.replace(/\//g, "_")).textContent.trim();

    this.template = Handlebars.default.compile(html);
  }
});

module.exports = BaseComponent;
