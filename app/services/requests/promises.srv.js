'use strict';

function promises($log) {

  'ngInject';

  /* jshint validthis: true */
  var that = this;

  var cancelPromises = new Map();
  var nextPromiseNumber = 0;

  that.addPromise = function (newPromise) {
    const promiseId = 'promise' + nextPromiseNumber;
    cancelPromises.set(promiseId, newPromise);
    nextPromiseNumber++;
    $log.debug(`[Promises] Added a new promise with id ${promiseId}! Now holding ${cancelPromises.size} promises.`);
    return promiseId;
  };

  that.removePromise = function (promiseId) {
    cancelPromises.delete(promiseId);
    $log.debug(`[Promises] Removed promise ${promiseId}, now holding ${cancelPromises.size} promises.`);
  };

  that.rejectAll = function () {

    // cancel each pending http request by resolving the promises
    for (var p of cancelPromises.values()) {
      p.resolve('canceled');
    }

    // clear promises map
    cancelPromises.clear();
    $log.warn(`[Promises] Cleared all promises! Now holding ${cancelPromises.size} promises.`);
  };

}

export default promises;
