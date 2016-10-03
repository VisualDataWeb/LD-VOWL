import propSelectionTemplate from './prop-selection.html';

/**
 * @ngdoc directive
 * @name propertySelection
 *
 * @description
 *
 * This directive shows details about selected properties in the graph.
 */
const propertySelection = function() {

  return {
    restrict: 'E',
    template: propSelectionTemplate
  };

};

export default propertySelection;
