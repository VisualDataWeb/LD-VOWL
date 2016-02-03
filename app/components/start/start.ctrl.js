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

  // SPARQL Endpoints taken from http://sparqles.ai.wu.ac.at/
  // TODO move this data into a constant
  start.endpoints = ["http://dbpedia.org/sparql",
    "http://lod.springer.com/sparql",
    "http://linkedlifedata.com/sparql",
    "http://transparency.270a.info/sparql",
    "http://bfs.270a.info/sparql",
    "http://dutchshipsandsailors.nl/data/sparql/",
    "http://data.allie.dbcls.jp/sparql",
    "http://affymetrix.bio2rdf.org/sparql",
    "http://drugbank.bio2rdf.org/sparql",
    "http://lsr.bio2rdf.org/sparql",
    "http://mesh.bio2rdf.org/sparql",
    "http://mgi.bio2rdf.org/sparql",
    "http://orphanet.bio2rdf.org/sparql",
    "http://sabiork.bio2rdf.org/sparql",
    "https://www.ebi.ac.uk/rdf/services/biomodels/sparql",    // very dense graph
    "https://www.ebi.ac.uk/rdf/services/biosamples/sparql",
    "https://www.ebi.ac.uk/rdf/services/biosamples/sparql",
    "https://www.ebi.ac.uk/rdf/services/chembl/sparql",
    "http://datos.bcn.cl/sparql",
    "http://enipedia.tudelft.nl/sparql",
    "http://environment.data.gov.uk/sparql/bwq/query",
    "http://lod.euscreen.eu/sparql",
    "http://enipedia.tudelft.nl/sparql",                      // quite fast
    "http://environment.data.gov.uk/sparql/bwq/query",
    "http://foodpedia.tk/sparql",                             // fast one
    "http://data.linkedu.eu/forge/query",                     // fast
    "http://healthdata.tw.rpi.edu/sparql",
    "http://lod.ac/bdls/sparql",
    "http://trulla.visus.uni-stuttgart.de:8081/linkedmdb/sparql",
    "http://trulla.visus.uni-stuttgart.de:8081/dblp/sparql",
    "http://trulla.visus.uni-stuttgart.de:8081/ciawfb/sparql",
    "http://trulla.visus.uni-stuttgart.de:8081/stackexchange/sparql",
    "http://dblp.l3s.de/d2r/sparql"];

  start.endpoint = RequestConfig.getEndpointURL();

  start.useLocalProxy = RequestConfig.getUseLocalProxy();

  start.updateUseLocalProxy = function () {
    RequestConfig.setUseLocalProxy(start.useLocalProxy);
  };

  /**
   * Shows the graph for the current endpoint and clears all data if endpoint has changed.
   */
  start.showGraph = function () {

      var lastEndpoint = RequestConfig.getEndpointURL();

      // clear loaded data if endpoint has changed
      if (lastEndpoint !== start.endpoint && start.endpoint !== undefined && start.endpoint.length > 0) {
        Nodes.clearAll();

        Properties.clearAll();
        Requests.clear();

        $log.warn("[Start] Cleared all saved data!");

        // change endpoint
        RequestConfig.setEndpointURL(start.endpoint);
      }

      if (start.endpoint !== undefined && start.endpoint.length > 0) {

        $log.debug("[Start] Show Graph!");

        // move to the graph view
        $location.path('graph');
      } else {
        $log.error("[Start] Please enter an url for the SPARQL endpoint!");
      }
  }; // end of showGraph()

}; // end of StartCtrl
