import angular from 'angular';

import FilterGroupCtrl from './filter-group.ctrl';
import FilterGroup from './filter-group.drv';

/**
 * @ngdoc module
 * @name components.sidebar.groups.filter
 *
 * @description
 *
 * This module represents the filter group of the sidebar accordion where the user can remove types of elements from the
 * node link graph.
 */
const filterModule = angular.module('components.sidebar.groups.filter', [])
                      .controller('FilterGroupCtrl', FilterGroupCtrl)
                      .directive('filterGroup', FilterGroup)
                      .name;

export default filterModule;
