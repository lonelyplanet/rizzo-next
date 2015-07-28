/* jshint node:true */

var path = require("path");

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
    loaders: [{ 
        test: /\.js$/, 
        exclude: /node_modules\/[^rizzo|flamsteed]/,
        loader: "babel-loader"
      },
      { 
        test: /\.scss$/, 
          loader: "style!css!sass?outputStyle=expanded&" +
          "includePaths[]=" + (path.resolve(__dirname, "./node_modules")) 
      },
      { 
        test: /\.hbs$/, 
        loader: "handlebars-loader" 
      }]
  }
};
