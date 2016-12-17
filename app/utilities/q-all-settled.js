import angular from 'angular';

/**
 * @param {$provide} $provide
 *
 * @ngInject
 */
function configure($provide) {

  $provide.decorator('$q', delegate);

  /**
   *
   * @param {$delegate} $delegate
   * @returns {*}
   *
   * @ngInject
   */
  function delegate($delegate) {
    let $q = $delegate;

    $q.allSettled = function(promises) {
      let wrappedPromises = angular.isArray(promises) ? promises.slice(0) : {};

      angular.forEach(promises, function(promise, index) {
        wrappedPromises[index] = promise.then(function(value) {
          return { state: 'fulfilled', value: value };
        }, function(reason){
          return { state: 'rejected', reason: reason };
        });
      });

      return $q.all(wrappedPromises);
    };

    return $q;
  } // end of delegate()
} // end of configure()

export default angular.module('qAllSettled', [])
                      .config(configure);
