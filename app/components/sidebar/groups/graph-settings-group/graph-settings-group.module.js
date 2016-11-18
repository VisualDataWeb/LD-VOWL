import angular from 'angular';

import GraphSettingsGroupCtrl from './graph-settings-group.ctrl';
import graphSettingsGroup from './graph-settings-group.drv';

/**
 * @ngdoc module
 * @name sidebar.groups.graphsettings
 *
 * @description
 *
 * This module represents the graph settings. It includes edge lengths and layout controls.
 */
const graphSettingsModule = angular.module('components.sidebar.groups.graphsettings', [])
                    .directive('graphSettingsGroup', graphSettingsGroup)
                    .controller('GraphSettingsCtrl', GraphSettingsGroupCtrl);

export default graphSettingsModule;
