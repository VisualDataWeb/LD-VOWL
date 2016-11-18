/**
 * @ngdoc service
 * @name Promises
 *
 * @description A service holding all promises.
 *
 * @param $log
 *
 * @ngInject
 */
function promises($log) {

  const that = this;

  let cancelPromises = new Map();
  let nextPromiseNumber = 0;

  /**
   * Adds a new promise and returns the id assigned to it.
   *
   * @param newPromise - the promise to be added
   * @returns {string} the id of the added promise
   */
  that.addPromise = function (newPromise) {
    const promiseId = 'promise' + nextPromiseNumber;
    cancelPromises.set(promiseId, newPromise);
    nextPromiseNumber++;
    $log.debug(`[Promises] Added a new promise with id ${promiseId}! Now holding ${cancelPromises.size} promises.`);
    return promiseId;
  };

  /**
   * Removes the promise with the given id.
   *
   * @param promiseId - the id of the promise to be deleted
   */
  that.removePromise = function (promiseId) {
    cancelPromises.delete(promiseId);
    $log.debug(`[Promises] Removed promise ${promiseId}, now holding ${cancelPromises.size} promises.`);
  };

  /**
   * Rejects and removes all promises.
   */
  that.rejectAll = function () {

    // cancel each pending http request by resolving the promises
    for (let p of cancelPromises.values()) {
      p.resolve('canceled');
    }

    // clear promises map
    cancelPromises.clear();
    $log.warn(`[Promises] Cleared all promises! Now holding ${cancelPromises.size} promises.`);
  };

  /**
   * Returns the amount of promises being hold by this service.
   *
   * @returns {number} the number of promises
   */
  that.getSize = function () {
    return cancelPromises.size;
  };

}

export default promises;
