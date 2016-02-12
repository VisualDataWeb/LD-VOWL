'use strict';

startCtrl.$inject = ['$log','$location', 'Nodes', 'Properties', 'Requests', 'RequestConfig'];

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
function startCtrl($log, $location, Nodes, Properties, Requests, RequestConfig) {

  /* jshint validthis: true */
  var start = this;

  // SPARQL Endpoints taken from http://sparqles.ai.wu.ac.at/
  // TODO move this data into a constant
  start.endpoints = ['http://dbpedia.org/sparql',
    'http://lod.springer.com/sparql', // scientific publications @ springer
    'http://linkedlifedata.com/sparql', // slow
    'http://transparency.270a.info/sparql',
    'http://bfs.270a.info/sparql', // swiss statistics, many subclass relations
    'http://dutchshipsandsailors.nl/data/sparql/', // no relations anymore (no errors), fast
    'http://semanticweb.cs.vu.nl/dss/sparql/', // dutch ships and sailors, with few edges
    'http://data.allie.dbcls.jp/sparql', // database center for life science
    'http://affymetrix.bio2rdf.org/sparql', // empty?
    'http://drugbank.bio2rdf.org/sparql', // empty ?
    'http://lsr.bio2rdf.org/sparql',
    'http://mesh.bio2rdf.org/sparql',
    'http://mgi.bio2rdf.org/sparql',
    'http://orphanet.bio2rdf.org/sparql',
    'http://sabiork.bio2rdf.org/sparql',
    'https://www.ebi.ac.uk/rdf/services/biomodels/sparql',    // very dense graph
    'https://www.ebi.ac.uk/rdf/services/biosamples/sparql',
    'https://www.ebi.ac.uk/rdf/services/biosamples/sparql',
    'https://www.ebi.ac.uk/rdf/services/chembl/sparql',
    'http://datos.bcn.cl/sparql', // about norms, with and without proxy, fast
    'http://lod.euscreen.eu/sparql', // about television, slow
    'http://enipedia.tudelft.nl/sparql',                      // quite fast
    'http://environment.data.gov.uk/sparql/bwq/query',
    'http://foodpedia.tk/sparql',                          // about food, fast but types don't work
    'http://data.linkedu.eu/forge/query',                     // fast
    'http://healthdata.tw.rpi.edu/sparql',
    'http://lod.ac/bdls/sparql',
    'http://trulla.visus.uni-stuttgart.de:8081/linkedmdb/sparql',
    'http://trulla.visus.uni-stuttgart.de:8081/dblp/sparql',
    'http://trulla.visus.uni-stuttgart.de:8081/ciawfb/sparql',
    'http://trulla.visus.uni-stuttgart.de:8081/stackexchange/sparql',
    'http://dblp.l3s.de/d2r/sparql',
    'http://visualdataweb.infor.uva.es/sparql', // spanish census 2001
    'http://sparql.jesandco.org:8890/sparql', // learning ressources, ASN:US
    'http://modip.aueb.gr/d2rq/sparql', // AUEB Linked Open Data
    'http://vocabulary.semantic-web.at/PoolParty/sparql/AustrianSkiTeam', // austrian ski team
    'http://opendata.aragon.es/sparql',
    'http://data.archiveshub.ac.uk/sparql',
    'http://lab.environment.data.gov.au/sparql', // Australian climate observation reference network (only via proxy)
    'http://lod.b3kat.de/sparql', // library union catalogues of Bavaria, Berlin and Brandenburg
    'http://dati.camera.it/sparql', // italian chamber of deputies
    'http://babelnet.org/sparql/', // babel, works via proxy but slow
    'http://www.ebi.ac.uk/rdf/services/biomodels/sparql', // slow, also available via https

    // has subclass relations, slow class-class relations and types
    'http://www.ebi.ac.uk/rdf/services/biosamples/sparql',
    'http://data.colinda.org/endpoint.php', // small dataset with two classes, only via proxy

    // Consorcio Regional de Transportes de Madrid proxy only, fast, no relations or types
    'http://crtm.linkeddata.es/sparql',

    'http://vocabulary.wolterskluwer.de/PoolParty/sparql/court', // very fast, infos about courts
    'http://rdf.disgenet.org/sparql/', // genetic diseases, properties have no meaningful names
    'http://linkeddata.finki.ukim.mk/sparql', // Drug Data from the Health Insurance Fund of Macedonia
    'http://fintrans.publicdata.eu/sparql',
    'http://www.ida.liu.se/projects/semtech/openrdf-sesame/repositories/energy' // about energy reduction, fast
  ];

  start.endpoint = RequestConfig.getEndpointURL();

  start.useLocalProxy = RequestConfig.getUseLocalProxy();

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

        $log.warn('[Start] Cleared all saved data!');

        // change endpoint
        RequestConfig.setEndpointURL(start.endpoint);
      }

      RequestConfig.setUseLocalProxy(start.useLocalProxy);

      if (start.endpoint !== undefined && start.endpoint.length > 0) {

        $log.debug('[Start] Show Graph!');

        // move to the graph view
        $location.path('graph');
      } else {
        $log.error('[Start] Please enter an url for the SPARQL endpoint!');
      }
  }; // end of showGraph()

} // end of StartCtrl

export default startCtrl;
