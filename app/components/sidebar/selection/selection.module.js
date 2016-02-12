import angular from 'angular';

// import all selection directives
import NoSelection from './no-selection.drv.js';
import ClassSelection from './class-selection.drv.js';
import TypeSelection from './type-selection.drv.js';
import PropertySelection from './prop-selection.drv.js';
import DatatypePropertySelection from './datatype-prop-selection.drv.js';
import SubclassPropertySelection from './subclass-prop-selection.drv.js';

// register directives and return new module name
export default angular.module('components.sidebar.selection', [])
  .directive('noSelection', NoSelection)
  .directive('classSelection', ClassSelection)
  .directive('typeSelection', TypeSelection)
  .directive('propSelection', PropertySelection)
  .directive('datatypePropSelection', DatatypePropertySelection)
  .directive('subclassPropSelection', SubclassPropertySelection)
  .name;
