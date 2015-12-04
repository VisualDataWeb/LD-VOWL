'use strict';

module.exports = function ($rootScope) {

  var that = this;

  that.pendingRequests = 0;
  that.successfulRequests = 0;
  that.failedRequests = 0;

  that.getPendingRequests = function () {
    return that.pendingRequests;
  };

  that.incPendingRequests = function () {
    that.pendingRequests++;
    $rootScope.$broadcast('pending-requests-changed', that.pendingRequests);
  };

  that.decPendingRequests = function () {
    if (that.pendingRequests > 0) {
      that.pendingRequests--;
    }
    $rootScope.$broadcast('pending-requests-changed', that.pendingRequests);
  };

  that.getSuccessfulRequests = function () {
    return that.successfulRequests;
  };

  that.incSuccessfulRequests = function () {
    that.successfulRequests++;
  };

  that.getFailedRequests = function () {
    return that.failedRequests;
  };

  that.incFailedRequests = function () {
    that.failedRequests++;
  };

  that.clear = function () {
    that.pendingRequests = 0;
    that.successfulRequests = 0;
    that.failedRequests = 0;
    $rootScope.$broadcast('pending-requests-changed', that.pendingRequests);
  };
  
};
