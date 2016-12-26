/**
 * @ngdoc service
 * @name RequestConfig
 *
 * @param {Storage} Storage
 *
 * @ngInject
 */
function requestConfig(Storage) {

  const proxyURL = __PROXY_URL__ || 'http://localhost/proxy.php';  // eslint-disable-line no-undef

  const ENDPOINT_KEY = 'endpoint';
  const PROXY_KEY = 'proxy';
  const LIMIT_KEY = 'limit';
  const ORDERED_FLAG_KEY = 'ordered';
  const LABEL_LANG_KEY = 'lang';

  let endpointURL = Storage.getItem(ENDPOINT_KEY) || '';
  let useProxy = Storage.getItem(PROXY_KEY) || 'false';
  let limit = 10;
  let sparqlTimeout = 30000;
  let debug = 'on';
  let labelLanguage = Storage.getItem(LABEL_LANG_KEY) || 'en';
  let format = 'application/sparql-results+json';

  let propertiesOrdered = true;

  const self = this;

  self.init = function () {
    Storage.setItem(ENDPOINT_KEY, endpointURL);
    Storage.setItem(PROXY_KEY, useProxy);

    // SPARQL limit
    let storedLimit = Storage.getItem(LIMIT_KEY);
    if (typeof storedLimit !== 'undefined' && storedLimit !== null) {
      limit = parseInt(storedLimit);
    } else {
      Storage.setItem(LIMIT_KEY, limit.toString());
    }

    // Properties ordered ?
    let storedOrderedFlag = Storage.getItem(ORDERED_FLAG_KEY);
    if (typeof storedOrderedFlag !== 'undefined' && storedLimit !== null) {
      propertiesOrdered = (storedOrderedFlag === 'true');
    } else {
      // save current state
      let ordered = (propertiesOrdered) ? 'true'  : 'false';
      Storage.setItem(ORDERED_FLAG_KEY, ordered);
    }
  };

  /**
   * Returns the URL to which the requests should be sent. This can be the URL of the selected endpoint for a direct
   * connection or a local proxy.
   *
   * @returns {*}
   */
  self.getRequestURL = function () {
    return (self.getUseProxy()) ? proxyURL : self.getEndpointURL();
  };

  self.getEndpointURL = function () {
    return endpointURL;
  };

  self.setEndpointURL = function (newEndpoint) {
    endpointURL = newEndpoint;
    Storage.setItem(ENDPOINT_KEY, newEndpoint);
  };

  /**
   * Returns true if a local proxy should be used for data retrieval, false otherwise.
   *
   * @returns {boolean}
   */
  self.getUseProxy = function () {
    return (useProxy === 'true');
  };

  /**
   * Set the flag whether a proxy should be used or not and saves the flag into a cookie.
   *
   * @param {boolean} proxy - true if proxy should be used, false otherwise
   */
  self.setUseProxy = function (proxy) {
    const proxyFlag = (proxy) ? 'true' : 'false';
    useProxy = proxyFlag;
    Storage.setItem(PROXY_KEY, proxyFlag);
  };

  self.getLimit = function () {
    return limit;
  };

  self.setLimit = function (newLimit) {
    limit = (typeof newLimit === 'number' && newLimit > 0) ? newLimit : limit;
    Storage.setItem(LIMIT_KEY, limit.toString());
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
    return labelLanguage;
  };

  self.setLabelLanguage = function (newLang) {
    labelLanguage = newLang;
    Storage.setItem(LABEL_LANG_KEY, newLang);
  };

  self.getPropertiesOrdered = function () {
    return propertiesOrdered;
  };

  self.setPropertiesOrdered = function (ordered) {
    propertiesOrdered = ordered;
    const flag = (ordered) ? 'true' : 'false';
    Storage.setItem(ORDERED_FLAG_KEY, flag);
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
   * Returns a configuration object for the given SPARQL query.
   * 
   * @param {string} query
   * @param {*} canceller
   * 
   * @return {{params: {timeout, debug, format, query}}}
   */
  self.forQuery = function(query, canceller) {
    const config = {};

    config.params = {
      timeout: sparqlTimeout,
      debug: debug,
      format: format,
      query: query
    };

    if (self.getUseProxy()) {
      config.params.endpoint = endpointURL;
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
