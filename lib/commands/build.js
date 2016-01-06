/* global process */
"use strict";

let fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    wpConfig = require("../../webpack.dist"),
    mkdirp = require("mkdirp"),
    compiler = require("../compiler");
    
let _ = {
  pick: require("lodash/object/pick"),
  reject: require("lodash/collection/reject"),
  reduce: require("lodash/collection/reduce"),
  each: require("lodash/collection/each")
}

let componentDir = path.join(__dirname, "../../src/components");

let getPartials = require("../methods/getPartials");
let getDirectories = require("../methods/getPartials");

module.exports = function build(components, options) {
  wpConfig.entry = wpConfig.entry || {};
  
  return new Promise((resolve, reject) => {
    let componentsToBuild = components || Object.keys(options.components);
    
    let componentConfig = _.reduce(componentsToBuild, (memo, component) => {
      let componentPath = path.join(componentDir, component);
      
      try {
        componentPath = require.resolve(path.join(componentDir, component));
      } catch(e) {
        console.log(`No component: ${component}`);
        process.exit(0);
      }
      
      memo[component] = componentPath;
      return memo;
    }, {});
    
    getPartials(componentDir, "components").then((partials) => {
      let baseConfig = {
        helpers: {
          nav_class_names: require("../../lib/helpers/nav_class_names")
        },
        partials: partials
      };
      
      mkdirp(options.dest, () => {
        _.each(componentConfig, (componentPath, name) => {
          let html = partials[`components/${name}/${name}`](options.components[name], baseConfig);
          
          fs.writeFileSync(path.join(process.cwd(), options.dest , `${name}.html`), html);

          wpConfig.entry[name] = componentPath;
        });
        
        console.log("Building components: %s", components.join(","));
        
        webpack(wpConfig, (err, stats) => {
          if (err) {
            reject(err);
            return console.error(err);
          }
          
          let time = (stats.endTime - stats.startTime) / 1000;
          
          console.log("Build completed in %d seconds with 0 errors.", time);
          
          resolve();
        });
      });
    });
  });
};
