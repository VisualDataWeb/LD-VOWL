'use strict';

/**
 * @Name StartCtrl
 *
 * @param $log
 * @param $location
 * @param Nodes
 * @param Properties
 * @param Requests
 * @param RequestConfig
 */
module.exports = function ($log, $location, Nodes, Properties, Requests, RequestConfig) {

  var start = this;

  // TODO move this data into a constant
  start.endpoints = ["http://dbpedia.org/sparql",
    "http://lod.springer.com/sparql",
    "http://linkedlifedata.com/sparql",
    "http://transparency.270a.info/sparql",
    "http://bfs.270a.info/sparql",
    "http://dutchshipsandsailors.nl/data/sparql/",
    "http://trulla.visus.uni-stuttgart.de:8081/linkedmdb/sparql",
    "http://trulla.visus.uni-stuttgart.de:8081/dblp/sparql",
    "http://trulla.visus.uni-stuttgart.de:8081/ciawfb/sparql",
    "http://trulla.visus.uni-stuttgart.de:8081/stackexchange/sparql"];

  start.endpoint = RequestConfig.getEndpointURL();

  /**
   * Shows the graph for the current endpoint and clears all data if endpoint has changed.
   */
  start.showGraph = function () {

      var lastEndpoint = RequestConfig.getEndpointURL();

      // clear loaded data if endpoint has changed
      if (lastEndpoint !== start.endpoint && start.endpoint.length > 0) {
        $log.warn("Clear all saved data!");

        Nodes.clearAll();
        Properties.clearAll();
        Requests.clear();

        // change endpoint
        RequestConfig.setEndpointURL(start.endpoint);
      }

      if (start.endpoint.length > 0) {

        $log.debug("[Start] Show Graph!");

        // move to the graph view
        $location.path('graph');
      } else {
        $log.error("[Start] Please enter an url for the SPARQL endpoint!");
      }
  }; // end of showGraph()

}; // end of StartCtrl
