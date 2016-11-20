import angular from 'angular';

import AboutCtrl from './about.ctrl';

/**
 * @ngdoc module
 * @name components.about
 * @description
 *
 * Module for the about page of the application.
 */
export default angular.module('components.about', [])
  .controller('AboutCtrl', AboutCtrl);
