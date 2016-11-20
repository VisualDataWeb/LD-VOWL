import propSelectionTemplate from './prop-selection.html';

/**
 * @ngdoc directive
 * @name propertySelection
 *
 * @description
 * This directive shows details about selected properties in the graph.
 * 
 * @return {*}
 */
const propertySelection = function() {

  return {
    restrict: 'E',
    template: propSelectionTemplate
  };

};

export default propertySelection;
