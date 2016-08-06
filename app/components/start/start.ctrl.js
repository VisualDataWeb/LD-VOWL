'use strict';

/**
 * @Name StartCtrl
 *
 * @param $log
 * @param $location
 * @param Data
 * @param View
 * @param Requests
 * @param RequestConfig
 */
function startCtrl($log, $location, Data, View, Requests, RequestConfig) {

  'ngInject';

  /* jshint validthis: true */
  var start = this;

  // most SPARQL Endpoints are taken from http://sparqles.ai.wu.ac.at/

  start.nonProxyEndpoints = [
    'http://dbpedia.org/sparql', // about dbpedia, works without proxy
    'http://ldf.fi/ww1lod/sparql', // about WW1, works without proxy, good candidate for user study
    'http://apps.morelab.deusto.es/labman/sparql', // works, fast

    'http://lod.springer.com/sparql', // about scientific publications @ springer, no relations (504 Gateway Timeout)
    'http://transparency.270a.info/sparql', // about corruption, works without proxy
    'http://bfs.270a.info/sparql', // swiss statistics, many subclass relations
    'http://dutchshipsandsailors.nl/data/sparql/', // no relations anymore (no errors), fast
    'http://semanticweb.cs.vu.nl/dss/sparql/', // dutch ships and sailors, with few edges

    'http://data.allie.dbcls.jp/sparql', // database center for life science, works without proxy, no types
    'https://www.ebi.ac.uk/rdf/services/biomodels/sparql',    // works without proxy, classes and types, very slow
    'http://www.ebi.ac.uk/rdf/services/biosamples/sparql', // works without proxy, types & props slow
    'https://www.ebi.ac.uk/rdf/services/biosamples/sparql',
    'http://www.ebi.ac.uk/rdf/services/biomodels/sparql', // slow, also available via https

    'https://www.ebi.ac.uk/rdf/services/chembl/sparql', // works without proxy, classes and types, slow
    'http://datos.bcn.cl/sparql', // about norms, works without proxy, classes and subclasses, fast
    'http://lod.euscreen.eu/sparql', // about television, works without proxy, (sub-)classes & types, slow
    'http://enipedia.tudelft.nl/sparql',                      // works without proxy, no types or properties, fast
    'http://environment.data.gov.uk/sparql/bwq/query', // works without proxy, no properties (query timeout), slow
    'http://foodpedia.tk/sparql',                          // about food, works without proxy, no types, fast

    //TODO check which does work
    'http://trulla.visus.uni-stuttgart.de:8081/linkedmdb/sparql',
    'http://trulla.visus.uni-stuttgart.de:8081/dblp/sparql',
    'http://trulla.visus.uni-stuttgart.de:8081/ciawfb/sparql',

    'http://trulla.visus.uni-stuttgart.de:8081/stackexchange/sparql',

    'http://vocabulary.semantic-web.at/PoolParty/sparql/AustrianSkiTeam', // austrian ski team
    'http://data.archiveshub.ac.uk/sparql', // works without proxy, some broken types, fast
    'http://resource.geolba.ac.at/PoolParty/sparql/GeologicTimeScale',
    'http://vocabulary.wolterskluwer.de/PoolParty/sparql/arbeitsrecht',
    'http://imf.270a.info/sparql', // no class-to-class relations, slow
    'http://data.linkedmdb.org/sparql',
    'http://linkedgeodata.org/sparql', // works but slow
    'http://www.lotico.com:3030/lotico/sparql', // semantic social network, works but slow
    'http://onto.mondis.cz/openrdf-sesame/repositories/mondis-record-owlim', // subclass relations broken
    'http://data.nobelprize.org/sparql', // works, rather slow
    'http://data.oceandrilling.org/sparql', // no errors, class-to-class rather slow
    'http://vocabulary.semantic-web.at/PoolParty/sparql/OpenData', // no errors, very abstract data set
    'http://data.utpl.edu.ec/ecuadorresearch/lod/sparql' // feq errors, dense graph, abstract data set
  ];

  start.proxyOnlyEndpoints =  [
    'http://www.influencetracker.com:8890/sparql', // about influence of twitter accounts, fast

    'http://linkedlifedata.com/sparql', // about some bio data, works only with proxy, slow

    'http://data.linkedu.eu/forge/query',                     // down?
    'http://healthdata.tw.rpi.edu/sparql',                    // down?
    'http://lod.ac/bdls/sparql',                              // down?
    'http://fintrans.publicdata.eu/sparql', // down?

    'http://dblp.l3s.de/d2r/sparql', // proxy only, socket hangs up
    'http://visualdataweb.infor.uva.es/sparql', // spanish census 2001, proxy only, no SAMPLE, slow
    'http://sparql.jesandco.org:8890/sparql', // learning ressources, ASN:US, proxy only, no types, fast
    'http://modip.aueb.gr/d2rq/sparql', // AUEB Linked Open Data, proxy only, slow
    'http://opendata.aragon.es/sparql', // proxy only, no subclasses, fast

    'http://lab.environment.data.gov.au/sparql', // Australian climate observation reference network (only via proxy)
    'http://lod.b3kat.de/sparql', // library union catalogues of Bavaria, Berlin and Brandenburg, proxy only
    'http://dati.camera.it/sparql', // italian chamber of deputies, proxy only
    'http://babelnet.org/sparql/', // babel, works only via proxy but slow

    'http://data.colinda.org/endpoint.php', // small dataset with two classes, only via proxy

    // Consorcio Regional de Transportes de Madrid proxy only, fast, no relations or types
    'http://crtm.linkeddata.es/sparql',

    'http://vocabulary.wolterskluwer.de/PoolParty/sparql/court', // very fast, infos about courts
    'http://rdf.disgenet.org/sparql/', // genetic diseases, proxy only, props have no meaningful names, no types
    'http://linkeddata.finki.ukim.mk/sparql', // Drug Data from the Health Insurance Fund of Macedonia

    'http://www.ida.liu.se/projects/semtech/openrdf-sesame/repositories/energy', // about energy reduction, fast
    'http://aemet.linkeddata.es/sparql',
    'http://data.globalchange.gov/sparql',
    'http://wordnet.okfn.gr:8890/sparql/',
    'http://greek-lod.auth.gr/police/sparql',
    'http://www.imagesnippets.com/sparql/images', // no class-to-class relations, slow
    'http://www.rechercheisidore.fr/sparql',
    'http://www.linklion.org:8890/sparql',
    'http://www.contextdatacloud.org:8890/sparql', // no types
    'http://sparql.reeep.org/', // no types
    'http://en.openei.org/sparql', // open energy info, dirty names, really fast
    'http://www.openmobilenetwork.org:8890/sparql' // fast, no types
  ];

  // jshint ignore:start
  start.proxyAvailable = __PROXY__; // eslint-disable-line no-undef
  // jshint ignore:end

  start.endpoints = (start.proxyAvailable) ? start.nonProxyEndpoints.concat(start.proxyOnlyEndpoints)
                                            : start.nonProxyEndpoints;

  start.endpoint = RequestConfig.getEndpointURL() || '';

  start.useLocalProxy = RequestConfig.getUseLocalProxy();

  start.endpointAlert = true;

  /**
   * This function is triggered every time the proxy flag is toggled.
   */
  start.updateUseLocalProxy = function () {
    Requests.clear();
    $log.warn('[Start] Cleared old requests.');
  };

  /**
   * Shows the graph for the current endpoint and clears all data if endpoint has changed.
   */
  start.showGraph = function () {

      var lastEndpoint = RequestConfig.getEndpointURL();

      // clear loaded data if endpoint has changed
      if (lastEndpoint !== start.endpoint && start.endpoint !== undefined && start.endpoint.length > 0) {
        Data.clearAll();

        View.reset();

        // change endpoint
        RequestConfig.setEndpointURL(start.endpoint);

        Data.initMaps();
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

  start.closeEndpointAlert = function () {
    start.endpointAlert = false;
  };

} // end of StartCtrl

export default startCtrl;
