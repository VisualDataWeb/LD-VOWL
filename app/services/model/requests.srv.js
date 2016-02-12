'use strict';

requests.$inject = ['$rootScope'];

function requests($rootScope) {

  /* jshint validthis: true */
  var that = this;

  that.pendingRequests = 0;
  that.successfulRequests = 0;
  that.failedRequests = 0;

  /**
   * Returns the number of pending requests.
   *
   * @returns {number}
   */
  that.getPendingRequests = function () {
    return that.pendingRequests;
  };

  /**
   * Increase the number of pending requests by one.
   */
  that.incPendingRequests = function () {
    that.pendingRequests++;
    $rootScope.$broadcast('pending-requests-changed', that.pendingRequests);
  };

  /**
   * Decrease the number of pending requests by one.
   */
  that.decPendingRequests = function () {
    if (that.pendingRequests > 0) {
      that.pendingRequests--;
    }
    $rootScope.$broadcast('pending-requests-changed', that.pendingRequests);
  };

  /**
   * Returns the number of successful requests.
   *
   * @returns {number}
   */
  that.getSuccessfulRequests = function () {
    return that.successfulRequests;
  };

  /**
   * Increases the number of successful requests by one.
   */
  that.incSuccessfulRequests = function () {
    that.successfulRequests++;
  };

  /**
   * Returns the number of failed requests.
   *
   * @returns {number}
   */
  that.getFailedRequests = function () {
    return that.failedRequests;
  };

  /**
   * Increases the number of failed requests by one.
   */
  that.incFailedRequests = function () {
    that.failedRequests++;
  };

  /**
   * Clears all data, setting numbers of pending, successful and failed requests to zero.
   */
  that.clear = function () {
    that.pendingRequests = 0;
    that.successfulRequests = 0;
    that.failedRequests = 0;
    $rootScope.$broadcast('pending-requests-changed', that.pendingRequests);
  };
  
} // end of export

export default requests;
