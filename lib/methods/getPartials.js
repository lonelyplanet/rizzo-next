"use strict";

let path = require("path"),
    fs = require("fs"),
    glob = require("glob"),
    compiler = require("../compiler");

module.exports = function getPartials(dir, pathPrefix) {
  return new Promise((resolve, reject) => {
    glob("**/*.hbs", { 
      cwd: dir
    }, (err, files) => {
      if (err) {
        reject(err);
      }
      
      let partials = files.reduce((memo, filename) => {
        let contents = fs.readFileSync(path.join(dir, filename)).toString();
        
        memo[`${pathPrefix}/${filename.replace(/\.hbs/, "")}`] = compiler.compile(contents);
        return memo;
      }, {});
      
      resolve(partials);
    });
  });  
};
