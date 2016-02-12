import angular from 'angular';

// import all group directives
import EndpointGroup from './endpoint-group.drv.js';
import NamespaceGroup from './namespace-group.drv.js';
import GraphSettingsGroup from './graph-settings-group.drv.js';
import FilterGroup from './filter-group.drv.js';
import SelectionGroup from './selection-group.drv.js';

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
