/**
 * @ngdoc service
 * @name Data
 *
 * @param {$log} $log
 * @param {Nodes} Nodes
 * @param {Properties} Properties
 * @param {Requests} Requests
 * @param {Promises} Promises
 *
 * @ngInject
 */
function dataService($log, Nodes, Properties, Requests, Promises) {

  /* jshint validthis: true */
  const that = this;

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
