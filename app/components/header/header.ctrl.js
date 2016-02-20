'use strict';

HeaderCtrl.$inject = ['$scope', '$location'];

/**
 * @name HeaderCtrl
 * @param $scope
 * @param $location
 */
function HeaderCtrl($scope, $location) {

  /**
   * Returns true if the given view location is the current one, false otherwise.
   *
   * @param viewLocation - the location of the view to check
   * @returns {boolean}
   */
  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

}

export default HeaderCtrl;
