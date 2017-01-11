/* global process */
"use strict";

let fs = require("fs"),
    path = require("path"),
    webpack = require("webpack"),
    wpConfig = require("../../webpack.dist"),
    mkdirp = require("mkdirp"),
    compiler = require("../compiler"),
    getPartials = require("../methods/getPartials");

let _ = {
  pick: require("lodash/pick"),
  reject: require("lodash/reject"),
  reduce: require("lodash/reduce"),
  each: require("lodash/each"),
  map: require("lodash/map"),
  keys: require("lodash/keys")
};

let buildTemplate = fs.readFileSync(path.join(__dirname, "../templates/rizzo-next-build.hbs"));
let buildTemplateCompiled = compiler.compile(buildTemplate.toString());

const outFileName = "rizzo-next-build.js";
const componentDir = path.join(__dirname, "../../src/components");

module.exports = function build(components, options) {
  wpConfig.entry = wpConfig.entry || {};

  return new Promise((resolve, reject) => {
    let componentsToBuild = components.length ? components : _.keys(options.components);

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
          nav_class_names: require("../../lib/helpers/nav_class_names"),
          capitalize: function(value) {
            return value.substr(0, 1).toUpperCase() + value.substr(1, value.length);
          }
        },
        partials: partials
      };

      mkdirp(options.dest, () => {
        _.each(componentConfig, (componentPath, name) => {
          if (!partials[`components/${name}/${name}`]) {
            return;
          }

          let html = partials[`components/${name}/${name}`](options.components[name], baseConfig);

          fs.writeFileSync(path.join(process.cwd(), options.dest , `${name}.html`), html);
        });

        let buildjs = buildTemplateCompiled({
          components: _.map(componentConfig, (componentPath, name) => {
            return {
              name, path: componentPath
            };
          })
        }, baseConfig);
        fs.writeFileSync(path.join(process.cwd(), options.dest, outFileName), buildjs);
        wpConfig.entry["rizzo-next"] = path.join(process.cwd(), options.dest, outFileName);

        console.log("Building components: %s", componentsToBuild.join(","));

        webpack(wpConfig, (err, stats) => {
          if (err || stats.compilation.errors.length) {
            err = err || stats.compilation.errors.map((e) => e.message).join("\n");
            reject(err);
            console.error(err);
            return process.exit(0);
          }

          let time = (stats.endTime - stats.startTime) / 1000;
          fs.unlinkSync(path.join(process.cwd(), options.dest, outFileName));

          console.log("Build completed in %d seconds with 0 errors.", time);
          resolve(stats);
        });
      });
    });
  });
};
