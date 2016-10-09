/**
 * @ngdoc type
 * @name HeaderCtrl
 *
 * @param $scope
 * @param $location
 *
 * @ngInject
 */
function HeaderCtrl($scope, $location) {

  const header = this;

  header.loading = false;

  // jshint ignore:start
  header.appVersion = (__VERSION__ !== undefined) ? __VERSION__ : '0.0'; // eslint-disable-line no-undef
  // jshint ignore:end

  $scope.$on('pending-requests-changed', function(event, pending) {
    header.loading = pending > 0;
  });

  /**
   * Returns true if the given view location is the current one, false otherwise.
   *
   * @param viewLocation - the location of the view to check
   * @returns {boolean}
   */
  header.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

}

export default HeaderCtrl;
