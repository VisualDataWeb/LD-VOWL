/*jshint browser:true */
'use strict';

require('./vendor.js')(); // run an empty function

require('../styles/main.css');
require('../styles/graph.css');
require('../../node_modules/jquery-ui/themes/base/jquery-ui.css');

var appModule = require('../app');

angular.element(document).ready(function () {
  angular.bootstrap(document, [appModule.name], {
   // strictDi: true
  });
});
