'use strict';

module.exports = function ($q, Requests) {
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
      Requests.incFailedRequests();
      return $q.reject(rejection);
    }
  };
};
