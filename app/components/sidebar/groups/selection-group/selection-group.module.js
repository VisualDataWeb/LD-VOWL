import angular from 'angular';

import SelectionGroup from './selection-group.drv';

export default angular.module('sidebar.groups.selection', [])
                      .directive('selectionGroup', SelectionGroup)
                      .name;
