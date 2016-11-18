import angular from 'angular';

import StartCtrl from './start.ctrl';

/**
 * @ngdoc module
 * @name component.start
 *
 * @description
 * This module represents the start view of the application.
 */
const startModule = angular.module('components.start', [])
  .controller('StartCtrl', StartCtrl);

export default startModule;
