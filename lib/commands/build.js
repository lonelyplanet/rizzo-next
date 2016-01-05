/* global process */
"use strict";

let fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    config = require("../../webpack.dist"),
    Handlebars = require("handlebars"),
    glob = require("glob"),
    mkdirp = require("mkdirp");

let navigationData = require("../data/navigation.json");
let componentDir = path.join(__dirname, "../../src/components");

let compiled = Handlebars.compile("{{> 'components/header/header'}}");

module.exports = function build(components, options) {
  let targets = components;
  
  return new Promise((resolve, reject) => {
      glob("**/*.hbs", { 
      cwd: componentDir
    }, (err, files) => {
      let partials = files.reduce((memo, filename) => {
        let contents = fs.readFileSync(path.join(componentDir, filename)).toString();
        memo["components/" + filename.replace(/\.hbs/, "")] = Handlebars.compile(contents);
        return memo;
      }, {});
      
      let html = compiled({
        type: "narrow",
        navigation: navigationData.items    
      }, {
        helpers: {
          nav_class_names: require("../../lib/helpers/nav_class_names")
        },
        partials: partials
      });
      
      mkdirp(options.dest, function() {
        fs.writeFileSync(path.join(options.dest , "header.html"), html);
        
        config.entry = config.entry || {};
    
        
        getDirectories(componentDir).forEach((dir) => {
          let componentPath;
          if (targets.indexOf(dir) > -1) {
            try {
              componentPath = require.resolve(path.join(componentDir, dir));
            } catch(e) {
              console.error(`No entry for component ${dir}`);
              return process.exit(0);
            }
            config.entry[dir] = componentPath;
          }
        });
        
        console.log("Building components: %s", targets.join(","));
        
        webpack(config, (err, stats) => {
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

function getDirectories(src) {
  return fs.readdirSync(src).filter(function(file) {
    return fs.statSync(path.join(src, file)).isDirectory();
  });
}