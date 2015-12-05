'use strict';
/**
 * @Name StartCtrl
 * @param $location
 * @param Nodes
 * @param Properties
 * @param Requests
 * @param RequestConfig
 */
module.exports = function ($location, Nodes, Properties, Requests, RequestConfig) {

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

    start.showGraph = function () {
      console.log("[Start] Show Graph!");
      var lastEndpoint = RequestConfig.getEndpointURL();

      // clear loaded data if endpoint has changed
      if (lastEndpoint !== start.endpoint && start.endpoint.length > 0) {
        Nodes.clearAll();
        Properties.clearAll();
        Requests.clear();

        // change endpoint
        RequestConfig.setEndpointURL(start.endpoint);
      }

      if (start.endpoint.length > 0) {
        // move to the graph view
        $location.path('graph');
      }
    };
  };
