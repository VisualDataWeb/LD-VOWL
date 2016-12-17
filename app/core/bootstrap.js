import angular from 'angular';

require('./vendor.js')(); // run an empty function

//TODO move into specific components
require('../styles/main.css');
require('../styles/graph.css');

import appModule from '../app';

angular.element(document).ready(function () {
  angular.bootstrap(document, [appModule.name], {
    strictDi: true
  });
});
