import angular from 'angular';

import SelectionGroup from './selection-group.drv';
import SelectionGroupCtrl from './selection-group.ctrl';

export default angular.module('sidebar.groups.selection', [])
                      .controller('SelectionGroupCtrl', SelectionGroupCtrl)
                      .directive('selectionGroup', SelectionGroup)
                      .name;
