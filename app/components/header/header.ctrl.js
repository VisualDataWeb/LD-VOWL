/**
 * @ngdoc type
 * @name HeaderCtrl
 *
 * @param {$scope} $scope
 * @param {$location} $location
 *
 * @ngInject
 */
function HeaderCtrl($scope, $location) {

  const header = this;

  header.collapse = true;

  header.loading = false;

  header.appVersion = (__VERSION__ !== undefined) ? __VERSION__ : '0.0'; // eslint-disable-line no-undef

  $scope.$on('pending-requests-changed', function(event, pending) {
    header.loading = pending > 0;
  });

  /**
   * Toggle navigation bar menu on small screens.
   */
  header.toggleCollapse = function() {
    header.collapse = !header.collapse;
  };

  /**
   * Returns true if the given view location is the current one, false otherwise.
   *
   * @param {string} viewLocation - the location of the view to check
   * @returns {boolean}
   */
  header.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

}

export default HeaderCtrl;
