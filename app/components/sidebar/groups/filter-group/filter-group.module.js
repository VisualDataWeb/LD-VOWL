import angular from 'angular';

import FilterGroupCtrl from './filter-group.ctrl';
import FilterGroup from './filter-group.drv';

export default angular.module('sidebar.groups.filter', [])
                      .controller('FilterGroupCtrl', FilterGroupCtrl)
                      .directive('filterGroup', FilterGroup)
                      .name;
