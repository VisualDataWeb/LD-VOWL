import classSelectionTemplate from './class-selection.html';

/**
 * @ngdoc directive
 * @name classSelection
 *
 * @description
 * This directive shows details about a class node selected in the graph.
 * 
 * @return {*}
 */
const classSelection = function() {

  return {
    restrict: 'E',
    template: classSelectionTemplate
  };

};

export default classSelection;
