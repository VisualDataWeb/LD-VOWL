'use strict';

/**
 * @name HeaderCtrl
 * @param $scope
 * @param $location
 */
function HeaderCtrl($scope, $location) {

  'ngInject';

  let header = this;

  header.loading = false;

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
