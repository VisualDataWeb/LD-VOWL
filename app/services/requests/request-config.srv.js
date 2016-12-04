/**
 * @ngdoc service
 * @name RequestConfig
 *
 * @param {$cookies} $cookies
 *
 * @ngInject
 */
function requestConfig($cookies) {

  const cookiePrefix = 'ldvowl_';
  const proxyURL = __PROXY_URL__ || 'http://localhost/proxy.php';  // eslint-disable-line no-undef

  let endpointURL = $cookies.get(cookiePrefix + 'endpoint') || '';
  let useProxy = $cookies.get(cookiePrefix + 'proxy') || 'false';
  let limit = 10;
  let sparqlTimeout = 30000;
  let debug = 'on';
  let labelLanguage = 'en';
  let format = 'application/sparql-results+json';

  let propertiesOrdered = true;

  const self = this;

  self.init = function () {
    $cookies.put(cookiePrefix + 'endpoint', endpointURL);
    $cookies.put(cookiePrefix + 'proxy', useProxy);

    // SPARQL limit
    let cookieLimit = $cookies.get(cookiePrefix + 'limit');
    if (typeof cookieLimit !== 'undefined') {
      limit = parseInt(cookieLimit);
    } else {
      $cookies.put(cookiePrefix + 'limit', limit.toString());
    }

    // Properties ordered ?
    let cookieOrdered = $cookies.get(cookiePrefix + 'ordered');
    if (typeof cookieOrdered !== 'undefined') {
      propertiesOrdered = (cookieOrdered === 'true');
    } else {
      // save current state
      let ordered = (propertiesOrdered) ? 'true'  : 'false';
      $cookies.put(cookiePrefix + 'ordered', ordered);
    }
  };

  /**
   * Returns the URL to which the requests should be sent. This can be the URL of the selected endpoint for a direct
   * connection or a local proxy.
   *
   * @returns {*}
   */
  self.getRequestURL = function () {
    let url;

    if (self.getUseProxy()) {
      url = proxyURL;
    } else {
      endpointURL = self.getEndpointURL();
      url = endpointURL;
    }

    return url;
  };

  self.getEndpointURL = function () {
    let cookieEndpoint = $cookies.get(cookiePrefix + 'endpoint');
    if (cookieEndpoint !== undefined) {
      endpointURL = cookieEndpoint;
    }
    return endpointURL;
  };

  self.setEndpointURL = function (newEndpoint) {
    endpointURL = newEndpoint;
    $cookies.put(cookiePrefix + 'endpoint', newEndpoint);
  };

  /**
   * Returns true if a local proxy should be used for data retrieval, false otherwise.
   *
   * @returns {boolean}
   */
  self.getUseProxy = function () {
    const cookieProxyFlag = $cookies.get(cookiePrefix + 'proxy');
    if (cookieProxyFlag !== undefined) {
      useProxy = cookieProxyFlag;
    }
    return (useProxy === 'true');
  };

  /**
   * Set the flag whether a proxy should be used or not and saves the flag into a cookie.
   *
   * @param {boolean} useProxy - true if proxy should be used, false otherwise
   */
  self.setUseProxy = function (useProxy) {
    const proxyFlag = (useProxy) ? 'true' : 'false';
    $cookies.put(cookiePrefix + 'proxy', proxyFlag);
  };

  self.getLimit = function () {
    return limit;
  };

  self.setLimit = function (newLimit) {
    limit = (typeof newLimit === 'number' && newLimit > 0) ? newLimit : limit;
    $cookies.put(cookiePrefix + 'limit', limit.toString());
  };

  self.getTimeout = function () {
    return sparqlTimeout;
  };

  self.setTimeout = function (newTimeout) {
    if (typeof newTimeout === 'number' && newTimeout > 0) {
      sparqlTimeout = newTimeout;
    }
  };

  self.getDebug = function () {
    return debug;
  };

  self.getLabelLanguage = function () {
    const cookieLang = $cookies.get(cookiePrefix + 'lang');
    if (cookieLang !== undefined) {
      labelLanguage = cookieLang;
    }
    return labelLanguage;
  };

  self.setLabelLanguage = function (newLang) {
    labelLanguage = newLang;
    $cookies.put(cookiePrefix + 'lang', newLang);
  };

  self.getPropertiesOrdered = function () {
    return propertiesOrdered;
  };

  self.setPropertiesOrdered = function (ordered) {
    propertiesOrdered = ordered;
    let flag = (ordered) ? 'true' : 'false';
    $cookies.put(cookiePrefix + 'ordered', flag);
  };

  /**
   * Switch between different formats for the SPARQL requests.
   */
  self.switchFormat = function () {
    if (format === 'application/sparql-results+json') {
      format = 'json';
    } else {
      format = 'application/sparql-results+json';
    }
    // another option would be 'srj' being used here: https://data.ox.ac.uk/sparql/
  };

  /**
   * Returns a configuration object for the given SPARQL query
   * 
   * @param {string} query
   * @param {*} canceller
   * @param {boolean} jsonp
   * 
   * @return {*}
   */
  self.forQuery = function (query, canceller, jsonp) {
    const config = {};

    config.params = {
      timeout: sparqlTimeout,
      debug: debug,
      format: format,
      query: query
    };

    if (useProxy) {
      config.params.endpoint = endpointURL;
    }

    if (jsonp) {
      config.params.callback = 'JSON_CALLBACK';
    }

    config.headers = {
      'Accept': 'application/sparql-results+json'
    };

    config.timeout = canceller.promise;

    return config;
  };

  self.init();

}

export default requestConfig;
