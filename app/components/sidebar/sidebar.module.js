import angular from 'angular';

import Slider from './slider.drv.js';

import groups from './groups/sidebar-groups.module';
import selections from './selection/selection.module';

/**
 * @ngdoc module
 * @name components.sidebar
 * 
 * @requires groups, selections
 * 
 * @description
 * 
 * This is the module for the sidebar of the application, including the directive for the jQuery slider.
 */
export default angular.module('components.sidebar', [groups.name, selections.name])
  .directive('slider', Slider);
