import angular from 'angular';

// import all group directives
import EndpointGroup from './groups/endpoint-group/endpoint-group.drv.js';
import NamespaceGroup from './groups/namespace-group/namespace-group.drv.js';
import GraphSettingsGroup from './groups/graph-settings-group/graph-settings-group.drv.js';
import FilterGroup from './groups/filter-group/filter-group.drv.js';
import SelectionGroup from './groups/selection-group/selection-group.drv.js';

import Slider from './slider.drv.js';

import selections from './selection/selection.module';

// create a new module, register directives and return its name
export default angular.module('sidebar', [selections])
  .directive('endpointGroup', EndpointGroup)
  .directive('namespaceGroup', NamespaceGroup)
  .directive('graphSettingsGroup', GraphSettingsGroup)
  .directive('filterGroup', FilterGroup)
  .directive('selectionGroup', SelectionGroup)
  .directive('slider', Slider)
  .name;
