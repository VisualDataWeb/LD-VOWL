'use strict';

function requests($rootScope, StopWatch) {

  'ngInject';

  /* jshint validthis: true */
  const that = this;

  that.promises = [];

  that.pendingRequests = 0;
  that.successfulRequests = 0;
  that.failedRequests = 0;

  that.errorStatus = new Set();
  that.statusArray = [];
  that.statusChanged = false;

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
      if (that.pendingRequests === 1) {
        StopWatch.stop();
      }
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
  that.incFailedRequests = function (status) {
    that.errorStatus.add(status);
    that.statusChanged = true;
    that.failedRequests++;
  };

  /**
   * Returns an array of status codes for the failed requests.
   *
   * @returns {Array}
   */
  that.getStatus = function () {
    if (that.statusArray.length === 0 || that.statusChanged) {
      that.statusArray.length = 0;
      for (let s of that.errorStatus.values()) {
        that.statusArray.push(s);
      }
      that.statusChanged = false;
    }

    return that.statusArray;
  };

  /**
   * Clears all data, setting numbers of pending, successful and failed requests to zero.
   */
  that.clear = function () {
    that.pendingRequests = 0;
    that.successfulRequests = 0;
    that.failedRequests = 0;
    that.errorStatus.clear();
    that.statusArray.length = 0;

    for (let i = 0; i < that.promises.length; i++) {
      that.promises[i].reject([]);
    }

    $rootScope.$broadcast('pending-requests-changed', that.pendingRequests);
  };
  
} // end of export

export default requests;
