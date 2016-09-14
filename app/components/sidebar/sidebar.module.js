import angular from 'angular';

import Slider from './slider.drv.js';

import groups from './groups/sidebar-groups.module';
import selections from './selection/selection.module';

// create a new module, register directives and return its name
export default angular.module('sidebar', [groups, selections])
  .directive('slider', Slider)
  .name;
