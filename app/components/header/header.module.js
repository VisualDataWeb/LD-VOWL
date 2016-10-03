import angular from 'angular';

import HeaderCtrl from './header.ctrl';
import HeaderDirective from './header.drv';

/**
 * @ngdoc module
 * @name components.header
 *
 * @description
 *
 * This is the module for the header of the application, showing the name, version number and sub pages.
 */
export default angular.module('components.header', [])
              .controller('HeaderCtrl', HeaderCtrl)
              .directive('header', HeaderDirective)
              .name;
