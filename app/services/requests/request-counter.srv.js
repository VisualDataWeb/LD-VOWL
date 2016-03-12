'use strict';

requestCounter.$inject = ['$q', 'Requests'];

/**
 * Counts successful and failed http requests.
 *
 * @param $q
 * @param Requests
 * @returns {{request: 'request', response: 'response', responseError: 'responseError'}}
 */
function requestCounter($q, Requests) {

  const templateRegEx = /.*\.html$/;

  return {
    'request': function (config) {
      // do not count template requests
      if (!config.url.match(templateRegEx)) {
        Requests.incPendingRequests();
      }
      return config;
    },

    'response': function (response) {
      // do not count template requests
      if (!response.config.url.match(templateRegEx)) {
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
