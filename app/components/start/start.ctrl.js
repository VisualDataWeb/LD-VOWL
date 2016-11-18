/**
 * @Name StartCtrl
 *
 * @param $log
 * @param $location
 * @param {Data} Data
 * @param View
 * @param Requests
 * @param {RequestConfig} RequestConfig
 * @param {Endpoints} Endpoints
 *
 * @ngInject
 */
function startCtrl($log, $location, Data, View, Requests, RequestConfig, Endpoints) {

  const start = this;

  start.proxyAvailable = __PROXY__; // eslint-disable-line no-undef

  start.endpoints = [];

  start.endpoint = RequestConfig.getEndpointURL() || '';

  start.useProxy = RequestConfig.getUseProxy();

  start.endpointAlert = true;

  /**
   * This function is triggered every time the proxy flag is toggled.
   */
  start.updateUseProxy = function () {
    Requests.clear();
    $log.warn('[Start] Cleared old requests.');
    start.loadProxyEndpoints();
  };

  /**
   * Shows the graph for the current endpoint and clears all data if endpoint has changed.
   */
  start.showGraph = function () {
    const lastEndpoint = RequestConfig.getEndpointURL();

    // clear loaded data if endpoint has changed
    if (lastEndpoint !== start.endpoint && start.endpoint !== undefined && start.endpoint.length > 0) {
      Data.clearAll();
      View.reset();

      // change endpoint
      RequestConfig.setEndpointURL(start.endpoint);

      Data.initMaps();
    }

    RequestConfig.setUseProxy(start.useProxy);

    if (start.endpoint !== undefined && start.endpoint.length > 0) {
      $log.debug('[Start] Show Graph!');

      // move to the graph view
      $location.path('graph');

      // $location url-encodes parameters automatically
      $location.search('endpointURL', start.endpoint);
    } else {
      $log.error('[Start] Please enter an url for the SPARQL endpoint!');
    }
  }; // end of showGraph()

  start.closeEndpointAlert = function () {
    start.endpointAlert = false;
  };

  const handleEndpointListResponse = function(response) {
    if (response === undefined || !Array.isArray(response.data)) {
      $log.error('[Start] No endpoints found!');
      return;
    }

    response.data.map((endpoint) => {
        let url;
        if (endpoint !== undefined && typeof endpoint.url === 'string') {
          url = endpoint.url;
        } else {
          url = '';
        }
        return url;
      })
      .filter((url) => url.length > 0)
      .forEach((endpointUrl) => start.endpoints.push(endpointUrl));

    $log.debug(`[Start] Retrieved ${start.endpoints.length} endpoints from server.`);
  };

  const handleEndpointListError = function (err) {
    if (err !== undefined && typeof err.status === 'number' && err.status === 404) {
      $log.error('[Start] List of SPARQL endpoints could not be retrieved from the server!');
    } else {
      $log.error(err);
    }
  };

  /**
   * Load list of available SPARQL endpoints from json file.
   */
  start.loadEndpoints = function () {
    Endpoints.getNonProxyEndpoints().then(handleEndpointListResponse, handleEndpointListError);

    if (start.useProxy) {
      start.loadProxyEndpoints();
    }
  };

  start.loadProxyEndpoints = function () {
    $log.debug('[Start] Also load endpoints only accessible via proxy.');
    Endpoints.getProxyEndpoints().then(handleEndpointListResponse, handleEndpointListError);
  };

  start.loadEndpoints();

} // end of StartCtrl

export default startCtrl;
