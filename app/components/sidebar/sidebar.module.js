import angular from 'angular';

import groups from './groups/sidebar-groups.module';
import selections from './selection/selection.module';

/**
 * @ngdoc module
 * @name components.sidebar
 * 
 * @requires groups, selections
 * 
 * @description
 * This is the module for the sidebar of the application.
 */
export default angular.module('components.sidebar', [groups.name, selections.name]);
