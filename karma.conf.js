var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};
webpackConfig.plugins.push(new webpack.DefinePlugin({
  __VERSION__: JSON.stringify(require('./package.json').version)
}));

webpackConfig.module.postLoaders = [];
webpackConfig.module.postLoaders.push(
  {
    test: /\.js$/,
    exclude: /(test|node_modules|bower_components)\//,
    loader: 'istanbul-instrumenter'
  }
);


// Karma configuration
// Generated on Thu Jan 21 2016 23:04:36 GMT+0100 (CET)

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    autoWatchBatchDelay: 300,

    // list of files / patterns to load in the browser
    files: [
      './test/test_index.js',
      'node_modules/babel-polyfill/dist/polyfill.js' // polyfill needed for things like Set
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './app/core/bootstrap.js': ['webpack', 'coverage'],
      './test/test_index.js': ['webpack']
    },

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    },

    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-sourcemap-loader',
      'karma-webpack',
      'karma-coverage'
    ]
  });
};
