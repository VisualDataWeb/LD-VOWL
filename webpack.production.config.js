'use strict';

var webpack = require('webpack');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
var ExtractPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var APP = __dirname + '/app';

module.exports = {
  // config goes here
  context: APP,
  entry: {
    app: ['./core/bootstrap.js'],
    vendors: [
      'angular',
      'angular-route',
      'angular-animate',
      'angular-cookies',
      'd3',
      'jquery',
      'jquery-ui',
      'bootstrap-webpack',
      'angular-ui-bootstrap'
    ]
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'ng-annotate!babel?presets[]=es2015', exclude: /node_modules/},
      { test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/},

      { test: /\.html$/, loader: 'ng-cache?prefix=[dir]/[dir]', exclude: /index.html/},

      // Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
      // loads bootstrap's css.
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff&name=fonts/[name].[ext]' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=img/[name].[ext]' },
      { test: /\.css$/, loader: ExtractPlugin.extract('style', 'css') },
      { test: /\.(jpg|png|gif|ico)$/, loader: 'file-loader?name=img/[name].[ext]'}
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      d3: 'd3',
      $: 'jquery',
      jQuery: 'jquery'
    }),

    new webpack.DefinePlugin({
      __LOGGING__: false,
      __PROXY__: true,
      __SESSION_STORAGE__: false,
      __SHOW_ENDPOINT__: true,
      __VERSION__: JSON.stringify(require('./package.json').version)
    }),

    new ngAnnotatePlugin({
      add: true
    }),

    new ExtractPlugin('styles.css'),

    new webpack.optimize.CommonsChunkPlugin('vendors', 'js/vendors.js'),

    new HtmlWebpackPlugin({
      title: 'LD-VOWL',
      template: 'index.ejs',
      favicon: __dirname + '/app/favicon.ico'
    })
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'js/bundle.js'
  },
  devtool: false
};
