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
    loaders: [{
        test: /\.js$/,
        exclude: /node_modules\/(?!rizzo|flamsteed).*/,
        loader: "babel-loader"
      },
      {
        // For some reason the sass-loader borks karma
        test: /\.scss$/,
        loader: "file"
        // loader: "style!css!sass"
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader"
      }]
  }
};
