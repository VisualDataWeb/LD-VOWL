import angular from 'angular';

import GraphSettingsGroupCtrl from './graph-settings-group.ctrl';
import graphSettingsGroup from './graph-settings-group.drv';

export default angular.module('sidebar.groups.graphsettings', [])
                    .directive('graphSettingsGroup', graphSettingsGroup)
                    .controller('GraphSettingsCtrl', GraphSettingsGroupCtrl)
                    .name;
