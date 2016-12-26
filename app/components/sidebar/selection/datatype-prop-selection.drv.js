import datatypePropSelectionTemplate from './datatype-prop-selection.html';

/**
 * @ngdoc directive
 * @name datatypePropertySelection
 *
 * @description
 * This directive shows details about a data type node selected in the graph.
 * 
 * @return {*}
 */
const datatypePropertySelection = function() {

  return {
    restrict: 'E',
    template: datatypePropSelectionTemplate
  };

};

export default datatypePropertySelection;
