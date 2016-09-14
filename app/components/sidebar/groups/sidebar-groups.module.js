import angular from 'angular';

import endpointGroup from './endpoint-group/endpoint-group.module';
import filterGroup from './filter-group/filter-group.module';
import graphSettingsGroup from './graph-settings-group/graph-settings-group.module';
import namespaceGroup from './namespace-group/namespace-group.module';
import selectionGroup from './selection-group/selection-group.module';

export default angular.module('sidebar.groups', [endpointGroup, filterGroup, graphSettingsGroup, namespaceGroup,
                              selectionGroup])
                      .name;
