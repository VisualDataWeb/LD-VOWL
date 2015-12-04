'use strict';

module.exports = function () {

  var endpointURL = 'http://dbpedia.org/sparql';
  var limit = 10;
  var sparqlTimeout = 30000;
  var debug = 'on';
  var labelLanguage = 'en';
  var format = 'json';

  this.getEndpointURL = function () {
    return endpointURL;
  };

  this.setEndpointURL = function (newEndpoint) {
    endpointURL = newEndpoint;
  };

  this.getLimit = function () {
    return limit;
  };

  this.setLimit = function (newLimit) {
    limit = (typeof newLimit === 'number') ? newLimit : limit;
  };

  this.getTimout = function () {
    return sparqlTimeout;
  };

  this.setTimout = function (newTimeout) {
    if (typeof newTimeout === 'number' && newTimeout > 0) {
      sparqlTimeout = newTimeout;
    }
  };

  this.getDebug = function () {
    return debug;
  };

  this.getLabelLanguage = function () {
    return labelLanguage;
  };

  this.setLabelLanguage = function (newLang) {
    labelLanguage = newLang;
  };

  /**
   * Returns a configuration object for the given SPARQL query
   */
  this.forQuery = function (query, short) {
    var config = {};
    if (short) {
      config.params = {
        query: query,
        output: format
      };

    } else {
      config.params = {
        timeout: sparqlTimeout,
        debug: debug,
        format: format,
        query: query
      };
    }

    config.headers = {
      "Accept": "application/sparql-results+json"
    };

    return config;
  };

};
