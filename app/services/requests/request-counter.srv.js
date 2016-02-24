'use strict';

requestCounter.$inject = ['$q', 'Requests'];

function requestCounter($q, Requests) {

  return {
    'request': function (config) {
      Requests.incPendingRequests();
      return config;
    },

    'response': function (response) {
      Requests.decPendingRequests();
      Requests.incSuccessfulRequests();
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

}

export default requestCounter;
