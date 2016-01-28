'use strict';

/**
 * @name HeaderCtrl
 * @param $scope
 * @param $location
 */
module.exports =  function ($scope, $location) {

  /**
   * Returns true if the given view location is the current one, false otherwise.
   *
   * @param viewLocation - the location of the view to check
   * @returns {boolean}
   */
  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

};