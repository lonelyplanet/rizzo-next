// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

var webpackConfig = require("./webpack.config");

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: "./",

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: [ "mocha", "sinon" ],

    // list of files / patterns to load in the browser
    files: [
      require.resolve("es5-shim/es5-shim.js"),
      "spec/index.js"
    ],


    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8081,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ["PhantomJS"],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    reporters: ["nyan"],

    webpack: {
        module: {
            noParse: webpackConfig.module.noParse,
            rules: webpackConfig.module.rules,
            // postLoaders: [{
            //     test: /\.jsx?$/,
            //     exclude: /(spec|node_modules|bower_components)\//,
            //     loader: "istanbul-instrumenter"
            // }]
        }
    },
    webpackMiddleware: {
        // webpack-dev-middleware configuration
        // i. e.
        noInfo: true
    },

    preprocessors: {
        "spec/**/*.js": ["webpack"],
        "src/**/*.js": ["webpack"]
    },

    coverageReporter: {

      dir : "docs/coverage",
      reporters: [{
        type : "html"
      }, {
        type: "lcov"
      }],
      check: {
        global: {
                statements: 30,
                branches: 30,
                functions: 25,
                lines: 30
            }
        }
    }
  });
};
