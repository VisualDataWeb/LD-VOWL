/*jshint browser:true */
'use strict';

require('./vendor.js')(); // run an empty function

require('../styles/main.css');
require('../styles/graph.css');

var appModule = require('../index');

angular.element(document).ready(function () {
 angular.bootstrap(document, [appModule.name], {
   // strictDi: true
 });
});
