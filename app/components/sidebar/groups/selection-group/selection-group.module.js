import angular from 'angular';

import SelectionGroup from './selection-group.drv';
import SelectionGroupCtrl from './selection-group.ctrl';

/**
 * @ngdoc module
 * @name components.sidebar.groups.selection
 *
 * @description
 *
 * This module includes the selection group of the sidebar accordion where details of the selected graph element are
 * shown.
 */
const selectionGroupModule = angular.module('sidebar.groups.selection', [])
                                    .controller('SelectionGroupCtrl', SelectionGroupCtrl)
                                    .directive('selectionGroup', SelectionGroup);

export default selectionGroupModule;
