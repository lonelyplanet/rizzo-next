/* jshint node:true */
var path = require("path"),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    webpack = require("webpack"),
    CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");

/**
 * 
 * This webpack config is for transpiling and running unit tests
 * 
 */
module.exports = {
  plugins: [
    // new webpack.optimize.UglifyJsPlugin(),
    new ExtractTextPlugin("[name].css"),
    // new CommonsPlugin({
    //   name: "common"
    // })
  ],
  // Component entries will be built dynamically
  entry: {
  },
  progress: true,
  
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "rizzo-next"
  },
  module: {
    noParse: /node_modules\/(jquery|keymirror)/,
    loaders: [{
        test: /\.jsx?$/,
        exclude: /node_modules\/(?!rizzo|flamsteed).*/,
        loader: "babel-loader?stage=1"
      },
      {
       test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader?browsers=last 3 version" +
          "!sass-loader?outputStyle=expanded&" +
          "includePaths[]=" + path.resolve(__dirname, "./node_modules"))
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
