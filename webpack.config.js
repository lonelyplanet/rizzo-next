/* jshint node:true */

var path = require("path");

/**
 * 
 * This webpack config is for transpiling and running unit tests
 * 
 */
module.exports = {
  progress: true,
  entry: {
    core: "./spec/index.js",
  },
  output: {
    path: path.join(__dirname, "tmp", "js", "spec"),
    filename: "tests.js",
    publicPath: "/",
    libraryTarget: "var"
  },
  module: {
    noParse: /node_modules\/(jquery|keymirror)/,
    loaders: [{
        test: /(\.jsx?)$/,
        loader: "babel",
        // Excluding everything EXCEPT rizzo-next and flamsteed
        exclude: /node_modules\/(?!rizzo|flamsteed).*/,
        query: {
            "plugins": ["transform-decorators-legacy"],
            "presets": ["es2015", "react"]
        }
      },
      {
        // For some reason the sass-loader borks karma
        test: /\.scss$/,
        // loader: "file"
        loader: "style!css!sass?includePaths[]=" + path.join(__dirname, "node_modules")
      },
      {
        test: /\.hbs$/,
        loader: "handlebars?rootRelative=" + path.join(__dirname, "src") + "/" + 
          "&runtime=" + require.resolve("handlebars/dist/handlebars.runtime")
      }, 
      {
        test: /picker(.date)?.js$/,
        loader: "imports?define=>false"
      }, {
        test: /sinon(.*)?\.js$/,
        loader: "imports?define=>false"
      }, {
        test: /\.json$/,
        loader: "json"
      }]
  }
};
