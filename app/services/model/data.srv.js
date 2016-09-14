'use strict';

/**
 * @Name Data
 *
 * @param {$log} $log
 * @param {Nodes} Nodes
 * @param Properties
 * @param {Requests} Requests
 * @param Promises
 */
function dataService($log, Nodes, Properties, Requests, Promises) {

  'ngInject';

  /* jshint validthis: true */
  var that = this;

  that.clearAll = function () {
    Promises.rejectAll();

    Nodes.clearAll();
    Properties.clearAll();
    Requests.clear();

    $log.warn('[Data] Cleared all saved data!');
  };

  that.initMaps = function () {
    Nodes.initMap();
    Properties.initProperties();
    $log.debug('[Data] Initialized nodes and properties.');
  };

}

export default dataService;
