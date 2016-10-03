import typeSelectionTemplate from './type-selection.html';

/**
 * @ngdoc directive
 * @name typeSelection
 *
 * @description
 * This directive shows details about a data type node selected in the graph.
 */
const typeSelection = function() {

  return {
    restrict: 'E',
    template: typeSelectionTemplate
  };

};

export default typeSelection;
