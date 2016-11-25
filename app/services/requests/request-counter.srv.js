/**
 * @ngdoc service
 * @name RequestCounter
 *
 * @description
 * Counts successful and failed http requests towards the SPARQL endpoint.
 *
 * @param {$q} $q
 * @param {Requests} Requests
 * @returns {Object}
 *
 * @ngInject
 */
function requestCounter($q, Requests) {

  const localFileRegEx = /^.+\.(css|html|js|json)$/;

  return {
    'request': function (config) {
      // do not count requests for local files (e.g. templates or json)
      if (config !== undefined && typeof config.url === 'string' && !config.url.match(localFileRegEx)) {
        Requests.incPendingRequests();
      }
      return config;
    },

    'response': function (response) {
      // do not count requests for local files (e.g. templates or json)
      if (!response.config.url.match(localFileRegEx)) {
        Requests.decPendingRequests();
        Requests.incSuccessfulRequests();
      }
      return response;
    },

    'responseError': function (rejection) {
      Requests.decPendingRequests();
      if (rejection.status !== undefined) {
        Requests.incFailedRequests(rejection.status);
      }
      return $q.reject(rejection);
    }
  };

} // end of requestCounter()

export default requestCounter;
